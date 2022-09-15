import Analytics from 'analytics';
import * as Bridge from 'bridge';
import fetch from 'utils/fetch';
import Razorpay, {
  makePrefParams,
  validateOverrides,
  getSdkMetaForRequestPayload,
  setPrefetchedPrefs,
  getPrefetchedPrefs,
  setNotes,
} from 'common/Razorpay';
import { flatten, RazorpayDefaults } from 'common/options';
import { shouldRedirect } from 'common/useragent';
import { Events, MetaProperties, Track, MiscEvents } from 'analytics';
import BrowserStorage from 'browserstorage';
import * as SessionManager from 'sessionmanager';
import * as ObjectUtils from 'utils/object';
import RazorpayStore, { getOrderId, setOption } from 'razorpay';
import { processNativeMessage } from 'checkoutstore/native';
import { isEMandateEnabled, getEnabledMethods } from 'checkoutstore/methods';
import showTimer, { checkoutClosesAt } from 'checkoutframe/timer';
import { create1ccShopifyCheckout } from 'checkoutframe/1cc-shopify';
import {
  setInstrumentsForCustomer,
  trackP13nMeta,
  removeDuplicateApiInstruments,
} from 'checkoutframe/personalization/api';
import { setHistoryAndListenForBackPresses } from 'bridge/back';
import * as _El from 'utils/DOM';

import { init as initI18n, bindI18nEvents } from 'i18n/init';

import { returnAsIs } from 'lib/utils';

import { cookieDisabled, isIframe, ownerWindow } from 'common/constants';

import { checkForPossibleWebPaymentsForUpi } from 'checkoutframe/components/upi';
import { reward } from 'checkoutstore/rewards';
import updateScore from 'analytics/checkoutScore';

import {
  appsThatSupportWebPayments,
  checkWebPaymentsForApp,
  additionalSupportedPaymentApps,
} from 'common/webPaymentsApi';

import { isStandardCheckout } from 'common/helper';
import feature_overrides from 'checkoutframe/overrideConfig';

import { getElementById } from 'utils/doc';
import { setBraveBrowser } from 'common/useragent';
import * as _ from 'utils/_';
import { appendLoader } from 'common/loader';
import { EventsV2, ContextProperties } from 'analytics-v2';
import { getExperimentsFromStorage } from 'experiments';
import { formatPrefExperiments } from 'misc/analytics/helper';

let CheckoutBridge = window.CheckoutBridge;

let isPrefetchPrefsFlowFor1cc = false;
let is1ccShopifyFlow = false;

const showModal = (session) => {
  Razorpay.sendMessage({ event: 'render' });

  if (CheckoutBridge) {
    const containerBox = getElementById('container');
    if (containerBox) {
      const rect = containerBox.getBoundingClientRect();
      Bridge.checkout.callAndroid(
        'setDimensions',
        Math.floor(rect.width),
        Math.floor(rect.height)
      );
    }
    getElementById('backdrop').style.background = 'rgba(0, 0, 0, 0.6)';
  }

  const qpmap = ObjectUtils.unflatten(_.getQueryParams());
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
      message = JSON.stringify(message);
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
    ObjectUtils.hasProp(navigator, 'language') ||
    ObjectUtils.hasProp(navigator, 'userLanguage')
  ) {
    Events.setMeta(
      MetaProperties.NAVIGATOR_LANGUAGE,
      navigator.language || navigator.userLanguage
    );
  }

  /**
   * Set network-related properties.
   */
  if (ObjectUtils.hasProp(navigator, 'connection')) {
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
    EventsV2.setContext(ContextProperties.SDK_PLATFORM, qpmap.platform);
    Events.setMeta(MetaProperties.SDK_PLATFORM, qpmap.platform);

    if (qpmap.version) {
      EventsV2.setContext(ContextProperties.SDK_VERSION, qpmap.version);
      Events.setMeta(MetaProperties.SDK_VERSION, qpmap.version);
    }
  }

  /**
   * Browser related meta properties
   */
  /**
   * in iframe isBraveBrowser doesn't work as expected to make sure we detect brave browser
   * we are moving check of isBraveBrowser to checkout.js and pass isBrave flag
   * via meta property using postmessage
   */
  if (message.metadata) {
    setBraveBrowser(message.metadata.isBrave);
    if (message.metadata.affordability_widget_fid) {
      Events.setMeta(
        MetaProperties.AFFORDABILITY_WIDGET_FID,
        message.metadata.affordability_widget_fid
      );
    }
    Events.setMeta(MetaProperties.BRAVE_BROWSER, message.metadata.isBrave);
  }
};

/**
 * Sets tracking props from the message
 * @param {Object} message
 */
const setTrackingProps = (message) => {
  if (message.library) {
    EventsV2.setContext(ContextProperties.LIBRARY, message.library);
    Track.props.library = message.library;
  }
  if (message.referer) {
    EventsV2.setContext(ContextProperties.REFERRER, message.referer);
    Track.props.referer = message.referer;
  }
};

export const handleMessage = function (message) {
  if (
    ('id' in message && !validUID(message.id)) ||
    message._module === 'interface'
  ) {
    return;
  }

  if (typeof message.embedded === 'boolean') {
    RazorpayStore.isEmbedded = message.embedded;
  }

  let id = message.id || Track.id;
  let session = SessionManager.getSession(id);

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
  let options = message.options;

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
    let oldSession = SessionManager.getSession();
    if (oldSession && _.isFunction(oldSession.saveAndClose)) {
      oldSession.saveAndClose();
    }

    session.id = id;
    session.r.id = id;
    Track.updateUid(id);
    EventsV2.setContext(ContextProperties.CHECKOUT_ID, id);
    SessionManager.setSession(session);
  }

  if (message.event === '1cc_shopify_checkout_initiate') {
    is1ccShopifyFlow = true;
    createShopifyCheckout(message.extra, session);
    return;
  }

  if (message.event === 'prefetch') {
    isPrefetchPrefsFlowFor1cc = true;
    setParamsForDdosProtection(session);
    getPrefsPromisified(session)
      .then((preferences) => {
        processPrefetchPrefs(preferences);
      })
      .catch(() => {
        Razorpay.sendMessage({
          event: 'event',
          data: {
            event: 'prefs_prefetch',
            data: 'error',
          },
        });
      });
    return;
  }

  if (message.event === 'open' || options) {
    if (isPrefetchPrefsFlowFor1cc || is1ccShopifyFlow) {
      /**
       * In the prefetch flow, instance creation is the first step and at that point we don't have all the
       * options we need to pass to the frame. Some options are set into the razorpay instance
       * using the .set() method. Since the session is created during the instance creation step
       * itself, when finally .open() is called there is a disparity b/w the instance in session(session.r)
       * and the razorpay instance. This function is meant to sync the two instances.
       */
      syncOptionsAndSessionInstance(session, options);
    }

    // triggering the open event, adding a safe check for sdk
    if (Bridge.hasCheckoutBridge()) {
      Track(session.r, MiscEvents.OPEN);
    }

    if (!ObjectUtils.isEmpty(message._order)) {
      // for prefetch prefs flow as there order object will need to be passed separately
      const prefetchedPrefsObj = getPrefetchedPrefs();
      setPrefetchedPrefs({ ...prefetchedPrefsObj, order: message._order });
    }

    if (!ObjectUtils.isEmpty(message._prefs)) {
      /**
       * _prefs is sent from the shopify script added to the rzp instance to be consumed here
       * and prevent fetching the preferences using a network call again.
       */
      setPrefetchedPrefs(message._prefs);
    }

    // NOTE: call this before making any XHR or jsonp call
    setParamsForDdosProtection(session);

    fetchPrefs(session);
  }

  try {
    if (_.isNonNullObject(CheckoutBridge)) {
      CheckoutBridge.sendAnalyticsData = Track.parseAnalyticsData;
      CheckoutBridge.sendExtraAnalyticsData = () => {};
    }
  } catch (e) {}
};

function syncOptionsAndSessionInstance(session, options) {
  const sessionOptions = session.r.get();

  // normalize options
  if (
    typeof options.retry === 'object' &&
    typeof options.retry.enabled === 'boolean'
  ) {
    options.retry = options.retry.enabled;
  }

  const flattenedOptions = flatten(options, RazorpayDefaults);
  const updatedOptions = { ...sessionOptions, ...flattenedOptions };

  let callback_url = updatedOptions.callback_url;
  if (callback_url && shouldRedirect) {
    updatedOptions.redirect = true;
  }

  setNotes(updatedOptions.notes || {});

  // run loop to update the instance with the synced options
  Object.keys(updatedOptions).map((optionKey) => {
    session.r.set(optionKey, updatedOptions[optionKey]);
  });
}

/**
 * Set all the necessary values to fetch, so that these values get
 * appended on every XHR or jsonp request as query param
 * @param {Object} session
 */
function setParamsForDdosProtection(session) {
  fetch.setKeylessHeader(session.r.get('keyless_header'));

  const qpmap = ObjectUtils.unflatten(_.getQueryParams());

  if (isStandardCheckout() && qpmap?.captcha_id) {
    Analytics.setMeta('captcha_id', qpmap.captcha_id);
  }

  if (isStandardCheckout() && qpmap?.session_token) {
    global.session_token = qpmap.session_token;
    Analytics.setMeta('session_token_available', true);
  }
}

function processPreferences(preferences, session) {
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
    preferences.offers.filter((offer) => offer.type === 'instant').length > 0 // offers must have instant offer
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
    setSessionPreferences(session, {
      /**
       * TODO: move this feature_overrides to pref-response
       */
      // this must be first so that test can remove this and run as required
      feature_overrides,
      ...preferences,
    });
    fetchRewards(session);
  }
}

function processPrefetchPrefs(preferences) {
  setPrefetchedPrefs(preferences);
  Razorpay.sendMessage({
    event: 'event',
    data: {
      event: 'prefs_prefetch',
      data: 'success',
    },
  });
}

function createShopifyCheckout(body, session) {
  create1ccShopifyCheckout(getPreferencesParams(session), body, (response) => {
    if (response.error || !response.preferences) {
      Razorpay.sendMessage({
        event: 'event',
        data: {
          event: 'shopify_failure',
        },
      });
      return;
    }
    delete response.status_code;
    Razorpay.sendMessage({
      event: 'event',
      data: {
        event: 'shopify_success',
        data: JSON.stringify(response),
      },
    });
  });
}

function getPrefsPromisified(session) {
  return new Promise((resolve) => {
    let loader;
    try {
      loader = Bridge.hasCheckoutBridge()
        ? appendLoader(document.body, false, Boolean(CheckoutBridge))
        : null;
    } catch (e) {
      // e
    }
    session.prefCall = Razorpay.payment.getPrefs(
      getPreferencesParams(session.r),
      (preferences) => {
        resolve(preferences);
        if (loader) {
          _El.detach(loader);
          loader = null;
        }
      }
    );
  });
}

function fetchPrefs(session) {
  if (session.isOpen) {
    return;
  }
  session.isOpen = true;
  performPrePrefsFetchOperations();

  getPrefsPromisified(session)
    .then((preferences) => {
      processPreferences(preferences, session);
    })
    .catch(() => {
      Razorpay.sendMessage({
        event: 'fault',
        data: 'Payment Failed',
      });
    });
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

  updateOptions(preferences);
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

  const qpmap = ObjectUtils.unflatten(_.getQueryParams());
  const methods = getEnabledMethods();
  if (!methods.length) {
    let message = 'No appropriate payment method found.';
    if (isEMandateEnabled() && !razorpayInstance.get('customer_id')) {
      message += '\nMake sure to pass customer_id for e-mandate payments';
    }
    return Razorpay.sendMessage({ event: 'fault', data: message });
  }

  try {
    if (preferences?.experiments?.upi_ux === 'variant_1') {
      additionalSupportedPaymentApps();
      checkForPossibleWebPayments();
    }
  } catch (error) {}

  initI18n().then(() => {
    session.render();
    showModal(session);
    let closeAt;
    const timeout = session.r.get('timeout');
    if (timeout) {
      closeAt = _.now() + timeout * 1000;
    }
    if (closeAt) {
      checkoutClosesAt.set(closeAt);
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

function getPreferencesParams(razorpayInstance) {
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
}

function updateAnalytics(preferences) {
  Events.setMeta(MetaProperties.FEATURES, preferences.features);
  EventsV2.setContext(ContextProperties.FEATURES, preferences.features);
  if (preferences && preferences.merchant_id) {
    Events.setMeta(MetaProperties.MERCHANT_ID, preferences.merchant_id);
    EventsV2.setContext(ContextProperties.MERCHANT_ID, preferences.merchant_id);
  }
  if (preferences && preferences.merchant_key) {
    Events.setMeta(MetaProperties.MERCHANT_KEY, preferences.merchant_key);
    EventsV2.setContext(
      ContextProperties.MERCHANT_KEY,
      preferences.merchant_key
    );
  }

  if (preferences?.merchant_name) {
    EventsV2.setContext(
      ContextProperties.MERCHANT_NAME,
      preferences.merchant_name
    );
  }

  if (preferences?.mode) {
    EventsV2.setContext(ContextProperties.MODE, preferences.mode);
  }

  if (getOrderId()) {
    EventsV2.setContext(ContextProperties.ORDER_ID, getOrderId());
  }

  EventsV2.setContext(ContextProperties.EXPERIMENTS, {
    ...getExperimentsFromStorage(),
    ...formatPrefExperiments(preferences.experiments),
  });

  // Set optional fields in meta
  const optionalFields = preferences.optional;
  if (Array.isArray(optionalFields)) {
    const isContactOptional = optionalFields.includes('contact');
    const isEmailOptional = optionalFields.includes('email');
    Events.setMeta(MetaProperties.OPTIONAL_CONTACT, isContactOptional);
    Events.setMeta(MetaProperties.OPTIONAL_EMAIL, isEmailOptional);
    EventsV2.setContext(ContextProperties.OPTIONAL_CONTACT, isContactOptional);
    EventsV2.setContext(ContextProperties.OPTIONAL_EMAIL, isEmailOptional);
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
    ObjectUtils.loop(preferred_methods, ({ instruments }, contact) => {
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
