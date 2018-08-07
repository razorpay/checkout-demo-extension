import * as Bridge from 'bridge';
import Razorpay from 'common/Razorpay';
import { initIframe } from 'checkoutframe/iframe';
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

let qpmap = null,
  epos_share_link;

function getNewIOSWebkitInstance() {
  //Verify inner CheckoutBridge property for new iOS devices
  return ((window.webkit || {}).messageHandlers || {}).CheckoutBridge;
}

function validUID(id) {
  if (isIframe && !CheckoutBridge) {
    if (!isString(id) || id.length < 14 || !/[0-9a-z]/i.test(id)) {
      return false;
    }
  }
  return true;
}

Razorpay.sendMessage = function(message) {
  var iosCheckoutBridgeNew = getNewIOSWebkitInstance();

  if (
    isNonNullObject(CheckoutBridge) ||
    isNonNullObject(iosCheckoutBridgeNew)
  ) {
    return Bridge.notifyBridge(message);
  }
  if (ownerWindow) {
    message.source = 'frame';
    message.id = Track.id;
    if (isNonNullObject(message)) {
      message = stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
};

function fetchPrefsAndShowModal(session) {
  // set test cookie
  // if it is not reflected at backend while fetching prefs, disable cardsaving
  /* TODO: import and use makePrefParams once migrated to ES6 */
  var prefData = makePrefParams(session);
  if (cookieDisabled) {
    prefData.checkcookie = 0;
  } else {
    prefData.checkcookie = 1;
    document.cookie = 'checkcookie=1;path=/';
  }

  /* TODO: move this handling to session */

  if (session.isOpen) {
    return;
  }
  session.isOpen = true;

  var timeout = session.get('timeout');
  if (timeout) {
    session.closeAt = now() + timeout * 1000;
  }

  session.prefCall = Razorpay.payment.getPrefs(prefData, function(response) {
    session.prefCall = null;
    if (response.error) {
      return Razorpay.sendMessage({
        event: 'fault',
        data: response.error.description,
      });
    }
    preferences = response;
    showModal(session);
  });
}

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

  addUpiIntentsData: (o, message) => {
    if (message.upi_intents_data && message.upi_intents_data.length) {
      o.upi_intents_data = message.upi_intents_data;
    }
  },

  addPreviousData: (o, message) => {
    var data = message.data;
    if (data) {
      if (isString(data)) {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }
      if (isNonNullObject(data)) {
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
    if (oldSession) {
      invoke('saveAndClose', oldSession);
    }
    session.id = Track.id = id;
    SessionManager.setSession(session);
  }

  if (message.event === 'open' || options) {
    // always fetch preferences, disregard backend printed one.
    session.fetchPrefs(preferences => {
      session.showModal(preferences);
    });
  } else if (message.event === 'close') {
    session.hide();
  }

  try {
    if (isNonNullObject(CheckoutBridge)) {
      // CheckoutBridge.sendAnalyticsData = parseAnalyticsData;
      CheckoutBridge.sendExtraAnalyticsData = e => {
        alert(e);
      };
    }
  } catch (e) {}
};

/* expose handleMessage to window for our Mobile SDKs */
window.handleMessage = handleMessage;

/**
 * Gives you a list of query param values given by mobile sdks via query param
 * It's a reliable to way to know the mobile SDK platform, version and library.
 * @return {Object} URL query params converted into an object.
 */
export const getQueryParams = function() {
  if (_.isNonNullObject(qpmap)) {
    return qpmap;
  }

  if (location.search) {
    return location.search |> _Str.sliceFrom(1) |> _.query2obj;
  }

  return {};
};

/* Session related functions */

// session.js peripherial
function showModal(session) {
  var options = preferences.options;

  // pass preferences options to app
  Bridge.checkout.callAndroid('setMerchantOptions', JSON.stringify(options));

  Customer.prototype.r = session.r;
  Razorpay.configure(options);
  showModalWithSession(session);
}

function showModalWithSession(session) {
  var order = (session.order = preferences.order);
  var invoice = (session.invoice = preferences.invoice);
  var subscription = (session.subscription = preferences.subscription);
  var get = session.get;
  var options = get();

  var prefillAmount = get('prefill.amount');
  if (prefillAmount) {
    options.amount = Number(Math.floor(prefillAmount));
  } else {
    if (order && order.amount) {
      options.amount = order.partial_payment ? order.amount_due : order.amount;
    } else if (invoice && invoice.amount) {
      options.amount = invoice.amount;
    } else if (subscription && subscription.amount) {
      options.amount = subscription.amount;
    }
  }

  if (order && order.bank && get('callback_url') && order.method !== 'upi') {
    options.redirect = true;
    return session.r.createPayment({
      contact: get('prefill.contact') || '9999999999',
      email: get('prefill.email') || 'void@razorpay.com',
      bank: order.bank,
      method: 'netbanking',
    });
  }
  // setPaymentMethods(session);
  if (!session.methods.count) {
    var message = 'No appropriate payment method found.';
    if (session.recurring && !options.customer_id && session.methods.emandate) {
      message += '\nMake sure to pass customer_id for e-mandate payments';
    }
    return Razorpay.sendMessage({ event: 'fault', data: message });
  }
  session.render();
  Razorpay.sendMessage({ event: 'render' });

  if (CheckoutBridge) {
    if (isFunction(CheckoutBridge.setDimensions)) {
      var containerBox = $('#container')[0];
      if (containerBox) {
        var rect = containerBox.getBoundingClientRect();
        CheckoutBridge.setDimensions(
          Math.floor(rect.width),
          Math.floor(rect.height)
        );
      }
    }
    $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
  }

  if (qpmap.error) {
    errorHandler.call(session, qpmap);
  }
  if (qpmap.tab) {
    session.switchTab(qpmap.tab);
  }
}

initIframe();
