import * as Bridge from 'bridge';
import Razorpay from 'common/Razorpay';
import Analytics from 'analytics';
import * as SessionManager from 'sessionmanager';
import { makePrefParams } from 'common/Razorpay';
import { getSortedApps } from 'common/upi';
import Track from 'tracker';

import {
  UPI_POLL_URL,
  PENDING_PAYMENT_TS,
  MINUTES_TO_WAIT_FOR_PENDING_PAYMENT,
  cookieDisabled,
  isIframe,
  ownerWindow,
} from 'common/constants';

var CheckoutBridge = window.CheckoutBridge;

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

const optionsTransformer = {
  addOptions: (o, message) => {
    o.options = _Obj.clone(message.options);
  },

  addFeatures: (o, message) => {
    const features = [
      'sdk_popup',
      'magic',
      'activity_recreated',
      'embedded',
      'params',
    ];
    const options = message.options;

    _Obj.loop(features, feature => {
      if (typeof message[feature] !== 'undefined') {
        o[feature] = message[feature];
      }
    });

    /* Share link option on ePOS App */
    if (options && options.epos_build_code >= 3) {
      o.epos_share_link = true;
    }
  },

  addExternalSdks: (o, message) => {
    if (_.isNonNullObject(message.external_sdks)) {
      o.hasAmazonpaySdk = message.external_sdks.amazonpay;
    }
  },

  addUpiIntentsData: (o, message) => {
    if (message.upi_intents_data && message.upi_intents_data.length) {
      o.all_upi_intents_data = message.upi_intents_data;
      o.upi_intents_data = getSortedApps(message.upi_intents_data);
    }
  },

  addPreviousData: (o, message) => {
    var data = message.data;
    if (data) {
      if (_.isString(data)) {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (_.isNonNullObject(data)) {
        o.data = data;
      }
    }
  },

  useTrackingProps: (o, message) => {
    var props = ['referer', 'integration'];

    _Obj.loop(props, prop => {
      if (typeof message[prop] !== 'undefined') {
        Track.props[prop] = message[prop];
      }
    });
  },
};

function transformOptions(message) {
  var response = {};
  _Obj.loop(optionsTransformer, (transformer, key) => {
    transformer.call(null, response, message);
  });

  return response;
}

export const handleMessage = function(message) {
  if ('id' in message && !validUID(message.id)) {
    return;
  }

  let transformedOptions = transformOptions(message);

  var id = message.id || Track.id;
  var session = SessionManager.getSession(id);
  var options = message.options;

  if (message.metadata && message.metadata.openedAt) {
    Analytics.setMeta('timeSince.open', _.timer());
  }

  if (!session) {
    if (!options) {
      return;
    }

    try {
      session = SessionManager.createSession(transformedOptions, id);
    } catch (e) {
      return Razorpay.sendMessage({ event: 'fault', data: e.message });
    }
    var oldSession = SessionManager.getSession();
    if (oldSession && _.isFunction(oldSession.saveAndClose)) {
      oldSession.saveAndClose();
    }

    session.id = id;
    Track.updateUid(id);

    SessionManager.setSession(session);
  }

  if (message.event === 'open' || options) {
    /* always fetch preferences, disregard backend printed one. */
    session.fetchPrefs(preferences => {
      session.showModal(preferences);
    });
  } else if (message.event === 'close') {
    session.hide();
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
