import { parseUPIIntentResponse, didUPIIntentSucceed } from 'common/upi';
import { getSession } from 'sessionmanager';
import { UPI_POLL_URL } from 'common/constants';

/* This is the Android CheckoutBridge */
export const CheckoutBridge = window.CheckoutBridge;

/* This is the iOS CheckoutBridge */
export const iCheckoutBridge = ((window.webkit || {}).messageHandlers || {})
  .CheckoutBridge;

/**
 * Generic Bridge interface for all the bridges and platforms
 * @param {String} bridgeName is taken as input
 */
function Bridge(bridgeName) {
  this.name = bridgeName;
  this._exists = false;
  this.platform = '';
  this.bridge = {};
  this.init();
}

Bridge.prototype = {
  init: function() {
    const bridgeName = this.name;
    const androidBridge = window[bridgeName];
    const iosBridge = ((window.webkit || {}).messageHandlers || {})[bridgeName];

    if (androidBridge) {
      this._exists = true;
      this.platform = 'android';
      this.bridge = androidBridge;
    } else if (iosBridge) {
      this._exists = true;
      this.platform = 'ios';
      this.bridge = iosBridge;
    }
  },

  exists: function() {
    if (!this._exists) {
      this.init();
    }

    return this._exists;
  },

  get: function(methodName) {
    if (!this.exists()) {
      return;
    }

    if (this.platform === 'android') {
      if (_.isFunction(this.bridge[methodName])) {
        return this.bridge[methodName];
      }
    } else if (this.platform === 'ios') {
      return this.bridge.postMessage;
    }
  },

  has: function(methodName) {
    if (this.exists() && this.get(methodName)) {
      return true;
    }

    return false;
  },

  callAndroid: function(methodName, ...params) {
    params =
      params
      |> _Arr.map(arg => (typeof arg === 'object' ? _Obj.stringify(arg) : arg));

    const method = this.get(methodName);

    if (method) {
      return method.apply(this.bridge, params);
    }
  },

  callIos: function(methodName, ...params) {
    const method = this.get(methodName);
    if (method) {
      try {
        return method.apply(this.bridge, {
          action: methodName,
          data: params[0],
        });
      } catch (e) {}
    }
  },

  call: function(methodName, ...params) {
    const method = this.get(methodName);

    if (method) {
      this.callAndroid.apply(this, methodName, params);
      this.callIos.apply(this, methodName, params);
    }
  },
};

export const checkout = new Bridge('CheckoutBridge');
export const storage = new Bridge('StorageBridge');

export const notifyBridge = message => {
  if (message && message.event) {
    var bridgeMethod = 'on' + message.event;
    var data = message.data;
    if (!isString(data)) {
      if (!data) {
        return checkout.callAndroid(bridgeMethod);
      }
      data = stringify(data);
    }
    invoke(bridgeMethod, CheckoutBridge, data);
  }
};

/* Global functions for Android SDK */

/**
 * window.handleOTP is defined for OTPElf inside our mobile SDKs
 * this function is called when user is on checkout and the OTP from
 * Razorpay is received
 * @param  {String} otp Just OTP or the entrie SMS body
 */
window.handleOTP = function(otp) {
  /* Old OTPelf will now send the whole body of the
   * message instead of just OTP */
  var matches = otp.match(/\b[0-9]{4}([0-9]{2})?\b/);
  otp = matches ? matches[0] : '';
  otp = String(otp).replace(/\D/g, '');
  var session = getSession();
  var otpEl = gel('otp');
  if (session && otpEl && !otpEl.vealue) {
    otpEl.value = otp;
    $('#otp-elem').removeClass('invalid');
  }
};

/**
 * window.upiIntentResponse is called everytime the intent app retuns a
 * response to our Mobile SDK.
 * @param  {Object} data The data returned by UPI intent activity
 */
window.upiIntentResponse = function(data) {
  /* TODO: use session manager here */
  var session = getSession();

  if (session.r._payment && session.upi_intents_data) {
    session.r.emit('payment.upi.intent_response', data);
  } else if (session.activity_recreated) {
    /**
     * If the activity is recreated and UPI Intent flow was used,
     * this method will be invoked when SDK wants to send Intent response.
     *
     * We parse the response, and if the txn did not suceed (user cancelled or
     * other reasons),
     * we tell the user that the payment was not completed.
     */

    var successfulTxn = data |> parseUPIIntentResponse |> didUPIIntentSucceed;

    if (!successfulTxn) {
      session.r.emit('activity_recreated_upi_intent_back_btn');
      session.recievedUPIIntentRespOnBackBtn = true;
    }
  }
};

/**
 * window.backPressed is called by Android SDK everytime android backbutton is
 * pressed by user. Checkout will handle the back button action if the user is
 * on a sub screen. Checkout will give a callback to android in case that there
 * no action that can be done on back button click.
 * @param  {Function} callback This function is called when there is no back
 *                             button action to be done on checkout side.
 *                             Android prompts for closing checkout in that case
 */
window.backPressed = function(callback) {
  /* TODO: session manager */
  var session = getSession();

  var pollUrl = storage.call('getString', UPI_POLL_URL);

  if (pollUrl) {
    session.hideErrorMessage();
  }

  if (
    session.tab &&
    !(session.get('prefill.method') && session.get('theme.hide_topbar'))
  ) {
    session.back();
  } else {
    invoke(callback, CheckoutBridge);
  }
};
