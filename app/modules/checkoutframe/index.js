import * as Bridge from 'bridge';
import Razorpay from 'common/Razorpay';
import Analytics from 'analytics';
import * as SessionManager from 'sessionmanager';
import { makePrefParams } from 'common/Razorpay';
import Track from 'tracker';
import { processNativeMessage } from 'checkoutstore/native';
import { isEMandateEnabled, getEnabledMethods } from 'checkoutstore/methods';

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
      () => Date.now() - message.metadata.openedAt
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
    /* always fetch preferences, disregard backend printed one. */
    session.fetchPrefs(({ preferences, validation }) => {
      const { error } = validation;

      if (error) {
        return Razorpay.sendMessage({
          event: 'fault',
          data: error,
        });
      } else {
        var qpmap = _.getQueryParams() |> _Obj.unflatten;
        var methods = getEnabledMethods();
        if (!methods.length) {
          var message = 'No appropriate payment method found.';
          if (isEMandateEnabled() && !options.customer_id) {
            message += '\nMake sure to pass customer_id for e-mandate payments';
          }
          return Razorpay.sendMessage({ event: 'fault', data: message });
        }
        session.render();
        session.showModal(preferences);
      }
    });
  }

  try {
    if (_.isNonNullObject(CheckoutBridge)) {
      CheckoutBridge.sendAnalyticsData = Track.parseAnalyticsData;
      CheckoutBridge.sendExtraAnalyticsData = e => {};
    }
  } catch (e) {}
};

/* expose handleMessage to window for our Mobile SDKs */
window.handleMessage = handleMessage;
