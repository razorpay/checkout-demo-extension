import * as Bridge from 'bridge';
import Razorpay, {
  makePrefParams,
  validateOverrides,
  getSdkMetaForRequestPayload,
} from 'common/Razorpay';
import { Events, MetaProperties, Track, MiscEvents } from 'analytics';
import BrowserStorage from 'browserstorage';
import * as SessionManager from 'sessionmanager';
import { setRazorpayInstance } from 'checkoutstore';
import RazorpayStore, { getMerchantOrder, setOption } from 'razorpay';
import { processNativeMessage } from 'checkoutstore/native';
import { isEMandateEnabled, getEnabledMethods } from 'checkoutstore/methods';
import showTimer from 'checkoutframe/timer';
import {
  setInstrumentsForCustomer,
  trackP13nMeta,
  removeDuplicateApiInstruments,
} from 'checkoutframe/personalization/api';
import { setHistoryAndListenForBackPresses } from 'bridge/back';

import { init as initI18n, bindI18nEvents } from 'i18n/init';

import { returnAsIs } from 'lib/utils';

import { cookieDisabled, isIframe, ownerWindow } from 'common/constants';

import { checkForPossibleWebPaymentsForUpi } from 'checkoutframe/components/upi';
import { reward } from 'checkoutstore/rewards';
import updateScore from 'analytics/checkoutScore';
import { isBraveBrowser } from 'common/useragent';

import {
  appsThatSupportWebPayments,
  checkWebPaymentsForApp,
} from 'common/webPaymentsApi';

let CheckoutBridge = window.CheckoutBridge;

const showModal = (session) => {
  Razorpay.sendMessage({ event: 'render' });

  if (CheckoutBridge) {
    const containerBox = _Doc.getElementById('container');
    if (containerBox) {
      const rect = containerBox.getBoundingClientRect();
      Bridge.checkout.callAndroid(
        'setDimensions',
        Math.floor(rect.width),
        Math.floor(rect.height)
      );
    }
    _Doc.getElementById('backdrop').style.background = 'rgba(0, 0, 0, 0.6)';
  }

  const qpmap = _Obj.unflatten(_.getQueryParams());
  if (qpmap.error) {
    session.errorHandler(qpmap);
  }

  if (qpmap.tab) {
    session.switchTab(qpmap.tab);
  }
};

const validUID = (id) => {
  /* check only for iFrame because we trust our SDKs */
  if (isIframe && !CheckoutBridge) {
    if (!_.isString(id) || id.length < 14 || !/[0-9a-z]/i.test(id)) {
      return false;
    }
  }
  return true;
};

Razorpay.sendMessage = function (message) {
  if (Bridge.hasCheckoutBridge()) {
    return Bridge.notifyBridge(message);
  }

  if (ownerWindow) {
    message.source = 'frame';
    message.id = Track.id;
    if (_.isNonNullObject(message)) {
      message = _Obj.stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
};

/**
 * Set meta for Analytics.
 * @param {Object} message
 */
const setAnalyticsMeta = (message) => {
  const qpmap = _.getQueryParams();

  /**
   * Set time-related properties.
   */
  if (message.metadata && message.metadata.openedAt) {
    Events.setMeta(
      MetaProperties.TIME_SINCE_OPEN,
      () => _.now() - message.metadata.openedAt
    );
  }

  /**
   * Set language-related properties.
   */
  if (
    _Obj.hasProp(navigator, 'language') ||
    _Obj.hasProp(navigator, 'userLanguage')
  ) {
    Events.setMeta(
      MetaProperties.NAVIGATOR_LANGUAGE,
      navigator.language || navigator.userLanguage
    );
  }

  /**
   * Set network-related properties.
   */
  if (_Obj.hasProp(navigator, 'connection')) {
    const { effectiveType, type, downlink } = navigator.connection;

    if (effectiveType || type) {
      Events.setMeta(MetaProperties.NETWORK_TYPE, effectiveType || type);
    }
    if (downlink) {
      Events.setMeta(MetaProperties.NETWORK_DOWNLINK, downlink);
    }
  }

  /**
   * Set SDK details.
   */
  if (qpmap.platform && ['android', 'ios'].includes(qpmap.platform)) {
    Events.setMeta(MetaProperties.SDK_PLATFORM, qpmap.platform);

    if (qpmap.version) {
      Events.setMeta(MetaProperties.SDK_VERSION, qpmap.version);
    }
  }

  /**
   * Browser related meta properties
   */
  isBraveBrowser().then((result) => {
    Events.setMeta(MetaProperties.BRAVE_BROWSER, result);
  });
};

/**
 * Sets tracking props from the message
 * @param {Object} message
 */
const setTrackingProps = (message) => {
  if (message.library) {
    Track.props.library = message.library;
  }
  if (message.referer) {
    Track.props.referer = message.referer;
  }
};

export const handleMessage = function (message) {
  if ('id' in message && !validUID(message.id)) {
    return;
  }

  var id = message.id || Track.id;
  var session = SessionManager.getSession(id);

  // response will come here only in case of iframe
  if (('razorpay_payment_id' in message || 'error' in message) && session) {
    // call coproto to complete the process
    session.r.emit('payment.complete', message);
    return;
  }

  if (message.event === 'close') {
    if (session) {
      session.closeAndDismiss();
    }
    return;
  }

  /**
   * Emit `payment.resume`
   */
  if (message.event === 'resume') {
    if (session) {
      session.r.emit('payment.resume', message.data);
    }
    return;
  }

  let transformedOptions = processNativeMessage(message);
  var options = message.options;

  setAnalyticsMeta(message);
  setTrackingProps(message);

  if (!session) {
    if (!options) {
      return;
    }

    try {
      session = SessionManager.createSession(transformedOptions, id);
    } catch (e) {
      return Razorpay.sendMessage({ event: 'fault', data: e });
    }
    var oldSession = SessionManager.getSession();
    if (oldSession && _.isFunction(oldSession.saveAndClose)) {
      oldSession.saveAndClose();
    }

    session.id = id;
    session.r.id = id;
    Track.updateUid(id);

    SessionManager.setSession(session);
  }

  if (message.event === 'open' || options) {
    // triggering the open event, adding a safe check for sdk
    if (Bridge.hasCheckoutBridge()) {
      Track(session.r, MiscEvents.OPEN);
    }

    fetch.setKeylessHeader(session.r.get('keyless_header'));

    fetchPrefs(session);
  }

  try {
    if (_.isNonNullObject(CheckoutBridge)) {
      CheckoutBridge.sendAnalyticsData = Track.parseAnalyticsData;
      CheckoutBridge.sendExtraAnalyticsData = (e) => {};
    }
  } catch (e) {}
};

function fetchPrefs(session) {
  if (session.isOpen) {
    return;
  }
  session.isOpen = true;

  performPrePrefsFetchOperations();

  session.prefCall = Razorpay.payment.getPrefs(
    getPreferenecsParams(session.r),
    (preferences) => {
      preferences.features = preferences.features || {};

      session.prefCall = null;

      if (preferences.error) {
        Razorpay.sendMessage({
          event: 'fault',
          data: preferences.error,
        });
      } else if (
        preferences.fee_bearer && // CFB
        preferences.offers &&
        preferences.offers.length > 0 &&
        preferences.offers.filter((offer) => offer.type === 'instant').length >
          0 // offers must have instant offer
      ) {
        /**
         * Failed Payment in offer(instant)+cfb fail opening of checkout
         */
        Razorpay.sendMessage({
          event: 'fault',
          data: 'Payment Failed',
        });
      } else {
        Razorpay.sendMessage({
          event: 'flush',
          data: preferences.mode,
        });
        setSessionPreferences(session, preferences);
        fetchRewards(session);
      }
    }
  );
}

function fetchRewards(session) {
  session.rewardsCall = Razorpay.payment.getRewards(
    getRewardsParams(session.r),
    (rewardsRes) => {
      session.rewardsCall = null;
      if (!rewardsRes.error) {
        const rewardObj = rewardsRes[0];
        if (rewardObj) {
          const { reward_id, variant = false } = rewardObj;
          if (reward_id) {
            reward.set(rewardObj);
            Events.setMeta(MetaProperties.REWARD_IDS, reward_id);
          }
          // Exp variation, true if the particular checkout falls under the experiment, false if checkout is not part of that experiment
          Events.setMeta(MetaProperties.REWARD_EXP_VARIANT, variant);
        }
      }
    }
  );
}

function performPrePrefsFetchOperations() {
  /* Start listening for back presses */
  setHistoryAndListenForBackPresses();

  checkForPossibleWebPayments();
}

function checkForPossibleWebPayments() {
  checkForPossibleWebPaymentsForUpi();
  checkForPossibleWebPaymentsForApps();
}

function checkForPossibleWebPaymentsForApps() {
  appsThatSupportWebPayments
    .filter((app) => app.method === 'app')
    .forEach((app) =>
      checkWebPaymentsForApp(app.package_name).catch(returnAsIs)
    );
}

function setSessionPreferences(session, preferences) {
  if (preferences.customer && preferences.customer.contact) {
    updateScore('loggedInUser');
  }
  const razorpayInstance = session.r;
  razorpayInstance.preferences = preferences;
  RazorpayStore.updateInstance(razorpayInstance);
  setRazorpayInstance(razorpayInstance);

  updateOptions(preferences);
  updateEmandatePrefill();
  updateAnalytics(preferences);
  updatePreferredMethods(preferences);

  Razorpay.configure(preferences.options);
  session.setPreferences(preferences);

  // session.setPreferences updates razorpay options.
  // validate options now
  try {
    validateOverrides(razorpayInstance);
  } catch (e) {
    return Razorpay.sendMessage({
      event: 'fault',
      data: e.message,
    });
  }

  /* pass preferences options to SDK */
  Bridge.checkout.callAndroid(
    'setMerchantOptions',
    JSON.stringify(preferences.options)
  );

  const qpmap = _.getQueryParams() |> _Obj.unflatten;
  const methods = getEnabledMethods();
  if (!methods.length) {
    var message = 'No appropriate payment method found.';
    if (isEMandateEnabled() && !razorpayInstance.get('customer_id')) {
      message += '\nMake sure to pass customer_id for e-mandate payments';
    }
    return Razorpay.sendMessage({ event: 'fault', data: message });
  }

  initI18n().then(() => {
    session.render();
    showModal(session);
    let closeAt;
    const timeout = session.r.get('timeout');
    if (timeout) {
      closeAt = _.now() + timeout * 1000;
    }
    if (closeAt) {
      session.timer = showTimer(closeAt, () => {
        session.dismissReason = 'timeout';
        session.modal.hide();
      });
    }
    /**
     * Allow show retry button in iOS
     * In Android on failure they send the error data via query param
     * whereas iOS send via handleMessage({..., params: ""}) using params property.
     * Before this fix, we read data from params and show the retry option but it immediately hide because of the missing check...
     * there was a check that existed for android. So this fix just added the check
     */
    let params = {};
    if (session.params) {
      try {
        if (typeof session.params === 'string') {
          params = JSON.parse(session.params);
        }
      } catch (e) {
        //
      }
    }

    const retryErrorHandler = !!qpmap.error || !!params.error;
    bindI18nEvents(retryErrorHandler, qpmap);
  });
}

function markRelevantPreferencesPayload(prefData) {
  const preferencesPayloadToBeMarked = [
    'subscription_id',
    'order_id',
    'key_id',
  ];
  preferencesPayloadToBeMarked.forEach((prop) => {
    if (prefData[prop]) {
      Events.setMeta(prop, prefData[prop]);
    }
  });
}

function getPreferenecsParams(razorpayInstance) {
  const prefData = makePrefParams(razorpayInstance);
  prefData.personalisation = 1;
  if (cookieDisabled) {
    prefData.checkcookie = 0;
  } else {
    /* set test cookie
     * if it is not reflected at backend while fetching prefs, disable
     * cardsaving */
    prefData.checkcookie = 1;
    document.cookie = 'checkcookie=1;path=/';
  }
  // TODO: make this a const
  const CREDExperiment = BrowserStorage.getItem('cred_offer_experiment');
  if (CREDExperiment) {
    prefData.cred_offer_experiment = CREDExperiment;
  }
  const sdk_meta = getSdkMetaForRequestPayload();
  if (sdk_meta) {
    prefData.sdk_meta = sdk_meta;
  }

  markRelevantPreferencesPayload(prefData);

  return prefData;
}

function getRewardsParams(razorpayInstance) {
  const rewardsData = makePrefParams(razorpayInstance);
  return rewardsData;
}

function updateOptions(preferences) {
  // Get amount
  const orderKey = ['order', 'invoice', 'subscription'].find(
    (key) => preferences[key] && _.isNumber(preferences[key].amount)
  );

  if (orderKey) {
    const order = preferences[orderKey];
    setOption(
      'amount',
      order.partial_payment ? order.amount_due : order.amount
    );
    if (order.currency) {
      setOption('currency', order.currency);
    }
  }

  // set orderid as it is required while creating payments
  if (preferences.invoice) {
    setOption('order_id', preferences.invoice.order_id);
  }
}

function updateEmandatePrefill() {
  const order = getMerchantOrder();
  if (!order) {
    return;
  }

  if (order.auth_type) {
    setOption('prefill.auth_type', order.auth_type);
  }

  const bank_account = order.bank_account;
  if (bank_account) {
    ['ifsc', 'name', 'account_number', 'account_type'].forEach((key) => {
      if (bank_account[key]) {
        setOption(`prefill.bank_account[${key}]`, bank_account[key]);
      }
    });
  }
  if (order.bank) {
    setOption('prefill.bank', order.bank);
  }
}

function updateAnalytics(preferences) {
  Events.setMeta(MetaProperties.FEATURES, preferences.features);
  if (preferences && preferences.merchant_id) {
    Events.setMeta(MetaProperties.MERCHANT_ID, preferences.merchant_id);
  }
  if (preferences && preferences.merchant_key) {
    Events.setMeta(MetaProperties.MERCHANT_KEY, preferences.merchant_key);
  }
  // Set optional fields in meta
  const optionalFields = preferences.optional;
  if (Array.isArray(optionalFields)) {
    Events.setMeta(
      MetaProperties.OPTIONAL_CONTACT,
      optionalFields.includes('contact')
    );
    Events.setMeta(
      MetaProperties.OPTIONAL_EMAIL,
      optionalFields.includes('email')
    );
  }
}

function updatePreferredMethods(preferences) {
  const { preferred_methods } = preferences;

  /**
   * Determine whether the user is logged in or not.
   * When preferences.preferred_methods response contains contact key which is not 'default'
   * we can presume that the user is logged in, because we get the contact number
   * as 'default' only for logged out user.
   */
  const isLogged = (contact) => contact !== 'default';

  if (preferred_methods) {
    _Obj.loop(preferred_methods, ({ instruments }, contact) => {
      if (instruments) {
        setInstrumentsForCustomer(
          {
            contact,
            logged: isLogged(contact),
          },
          removeDuplicateApiInstruments(instruments)
        );
      }
    });
  }
  trackP13nMeta(preferred_methods);
}

/* expose handleMessage to window for our Mobile SDKs */
window.handleMessage = handleMessage;
