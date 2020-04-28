import * as Bridge from 'bridge';
import Razorpay, { makePrefParams, validateOverrides } from 'common/Razorpay';
import Analytics from 'analytics';
import * as SessionManager from 'sessionmanager';
import Track from 'tracker';
import { processNativeMessage } from 'checkoutstore/native';
import { isEMandateEnabled, getEnabledMethods } from 'checkoutstore/methods';
import showTimer from 'checkoutframe/timer';

import {
  UPI_POLL_URL,
  PENDING_PAYMENT_TS,
  MINUTES_TO_WAIT_FOR_PENDING_PAYMENT,
  cookieDisabled,
  isIframe,
  ownerWindow,
} from 'common/constants';

let CheckoutBridge = window.CheckoutBridge;

const validUID = id => {
  /* check only for iFrame because we trust our SDKs */
  if (isIframe && !CheckoutBridge) {
    if (!_.isString(id) || id.length < 14 || !/[0-9a-z]/i.test(id)) {
      return false;
    }
  }
  return true;
};

Razorpay.sendMessage = function(message) {
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
const setAnalyticsMeta = message => {
  const qpmap = _.getQueryParams();

  /**
   * Set time-related properties.
   */
  if (message.metadata && message.metadata.openedAt) {
    Analytics.setMeta(
      'timeSince.open',
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
    Analytics.setMeta(
      'navigator.language',
      navigator.language || navigator.userLanguage
    );
  }

  /**
   * Set network-related properties.
   */
  if (_Obj.hasProp(navigator, 'connection')) {
    const { effectiveType, type } = navigator.connection;

    if (effectiveType || type) {
      Analytics.setMeta('network.type', effectiveType || type);
    }
  }

  /**
   * Set SDK details.
   */
  if (qpmap.platform && _Arr.contains(['android', 'ios'], qpmap.platform)) {
    Analytics.setMeta('sdk.platform', qpmap.platform);

    if (qpmap.version) {
      Analytics.setMeta('sdk.version', qpmap.version);
    }
  }
};

export const handleMessage = function(message) {
  if ('id' in message && !validUID(message.id)) {
    return;
  }

  var id = message.id || Track.id;
  var session = SessionManager.getSession(id);

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
    fetchPrefs(session);
  }

  try {
    if (_.isNonNullObject(CheckoutBridge)) {
      CheckoutBridge.sendAnalyticsData = Track.parseAnalyticsData;
      CheckoutBridge.sendExtraAnalyticsData = e => {};
    }
  } catch (e) {}
};

function fetchPrefs(session) {
  if (session.isOpen) {
    return;
  }
  session.isOpen = true;

  /* Start listening for back presses */
  Bridge.setHistoryAndListenForBackPresses();

  let closeAt;
  const timeout = session.r.get('timeout');
  if (timeout) {
    closeAt = _.now() + timeout * 1000;
  }

  session.prefCall = Razorpay.payment.getPrefs(
    getPreferenecsParams(session.r),
    preferences => {
      session.prefCall = null;
      if (preferences.error) {
        Razorpay.sendMessage({
          event: 'fault',
          data: preferences.error,
        });
      } else {
        setSessionPreferences(session, preferences);
        if (closeAt) {
          session.timer = showTimer(closeAt, () => {
            session.dismissReason = 'timeout';
            session.modal.hide();
          });
        }
      }
    }
  );
}

function setSessionPreferences(session, preferences) {
  const razorpayInstance = session.r;
  const order = preferences.order;

  if (
    order &&
    order.bank &&
    order.method === 'netbanking' &&
    razorpayInstance.get('callback_url')
  ) {
    redirectForTPV(razorpayInstance, preferences);
  } else {
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
    session.render();
    session.showModal(preferences);
  }
}

function redirectForTPV(razorpayInstance, preferences) {
  razorpayInstance.set('redirect', true);

  var paymentPayload = {
    amount: razorpayInstance.get('amount'),
    bank: preferences.order.bank,
    contact: razorpayInstance.get('prefill.contact') || '9999999999',
    email: razorpayInstance.get('prefill.email') || 'void@razorpay.com',
    method: 'netbanking',
  };

  razorpayInstance.createPayment(paymentPayload, {
    fee: preferences.fee_bearer,
  });
}

function getPreferenecsParams(razorpayInstance) {
  const prefData = makePrefParams(razorpayInstance);
  if (cookieDisabled) {
    prefData.checkcookie = 0;
  } else {
    /* set test cookie
     * if it is not reflected at backend while fetching prefs, disable
     * cardsaving */
    prefData.checkcookie = 1;
    document.cookie = 'checkcookie=1;path=/';
  }
  return prefData;
}

/* expose handleMessage to window for our Mobile SDKs */
window.handleMessage = handleMessage;
