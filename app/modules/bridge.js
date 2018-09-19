import { parseUPIIntentResponse, didUPIIntentSucceed } from 'common/upi';
import { getSession } from 'sessionmanager';
import { UPI_POLL_URL } from 'common/constants';
import * as Confirm from 'confirm';

import Track from 'tracker';

/* Our primary bridge is CheckoutBridge */
export const defineIosBridge = () => {
  let CB = {
    /* unique id for ios to retieve resources */
    index: 0,
    map: {},
    get: function(index) {
      var val = this.map[this.index];
      delete this.map[this.index];
      return val;
    },
    getUID: function() {
      return Track.id;
    },
  };

  return (window.CheckoutBridge = CB);
};

export const getNewIosBridge = () =>
  ((window.webkit || {}).messageHandlers || {}).CheckoutBridge;

export const hasNewIosBridge = () => Boolean(getNewIosBridge());

export const getCheckoutBridge = () => window.CheckoutBridge;

export const hasCheckoutBridge = () => Boolean(getCheckoutBridge());

export const iosLegacyMethod = method => {
  let CheckoutBridge = getCheckoutBridge();
  let doc = _Doc.documentElement;

  return function(data) {
    /* setting up js → ios communication by loading custom protocol inside
     * hidden iframe */
    var iF = _El.create('iframe');
    var src = 'razorpay://on' + method;
    if (data) {
      src += '?' + CheckoutBridge.index;
      CheckoutBridge.map[++CheckoutBridge.index] = data;
    }
    iF.setAttribute('src', src);

    doc.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  };
};

/**
 * Generic Bridge interface for all the bridges and platforms.
 * Bridge interface is not to be used for legacy iOS SDKs
 * @param {String} bridgeName is taken as input
 **/
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
    /* A little misleading because CheckoutBridge can exist for iOS as well */
    const androidBridge = window[bridgeName];
    const iosBridge = ((window.webkit || {}).messageHandlers || {})[bridgeName];

    if (iosBridge) {
      this._exists = true;
      this.bridge = iosBridge;
      this.platform = 'ios';
    } else if (androidBridge) {
      this._exists = true;
      this.bridge = androidBridge;
      this.platform = 'android';
    }
  },

  exists: function() {
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

  /**
   * This is used to call Android's bridges.
   *
   * Note: it won't be able to invoke CheckoutBridge for iOS because the
   * CheckoutBridge is instantiated on iOS after the bridge `init` is called.
   * So, according to the Bridge it does not exist for iOS, call it manually
   * for iOS similar to notifyBridge method.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
  callAndroid: function(methodName, ...params) {
    params =
      params
      |> _Arr.map(arg => (typeof arg === 'object' ? _Obj.stringify(arg) : arg));

    const method = this.get(methodName);

    if (method) {
      return method.apply(this.bridge, params);
    }
  },

  /**
   * This is used to call iOS's bridges.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
  callIos: function(methodName, ...params) {
    const method = this.get(methodName);

    if (method) {
      try {
        let dataObject = { action: methodName };

        let parameters = params[0];
        if (parameters) {
          dataObject.body = parameters;
        }

        return method.call(this.bridge, dataObject);
      } catch (e) {}
    }
  },

  /**
   * Generic method that calls the appropriate bridge for the current platform.
   *
   * @param  {String}    methodName name of the method to be invoked
   * @param  {Array}     params     method params
   * @return {Any}                  the value returned by the bridge method.
   *                                Nothing is returned in default cases.
   **/
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

/**
 * This method is used to notify events to the SDK bridges
 * This function is only called if CheckoutBridge exists
 * @param  {object} message to be sent to bridge
 */
export const notifyBridge = message => {
  /*
   * Use CheckoutBridge here and not instance of Bridge.
   * checkout instance of Bridge is instantiated at the time of first execution
   * of code. At that time only native CheckoutBridge exists (for Android).
   *
   * The mock CheckoutBridge that we create for iOS does not exist at the time
   * of first execution.
   *
   * We want to keep mock CheckoutBridge for iOS separate from checkout
   * instance of the Bridge. This is due to legacy reasons.
   */
  let CheckoutBridge = getCheckoutBridge();

  if (!CheckoutBridge) {
    return;
  }

  if (message && message.event) {
    let bridgeMethod = `on${message.event}`;
    var method = CheckoutBridge[bridgeMethod];

    if (!_.isFunction(method)) {
      return;
    }

    let data = message.data;
    if (!_.isString(data)) {
      if (!data) {
        if (method) {
          return method.call(CheckoutBridge);
        }
      }
      data = _Obj.stringify(data);
    }

    method.call(CheckoutBridge, data);
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
  var otpEl = _Doc.querySelector('#otp');
  if (session && otpEl && !otpEl.value) {
    otpEl.value = otp;

    _Doc.querySelector('#otp-elem') |> _El.removeClass('invalid');
  }
};

/**
 * window.upiIntentResponse is called everytime the intent app retuns a
 * response to our Mobile SDK.
 * @param  {Object} data The data returned by UPI intent activity
 */
window.upiIntentResponse = function(data) {
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
 * @param  {String} callback This function is called when there is no back
 *                           button action to be done on checkout side.
 *                           Android prompts for closing checkout in that case
 */
window.backPressed = function(callback) {
  let CheckoutBridge = getCheckoutBridge();
  var session = getSession();

  var pollUrl = storage.call('getString', UPI_POLL_URL);

  if (pollUrl) {
    session.hideErrorMessage();
  }

  if (Confirm.isConfirmShown) {
    Confirm.hide(true);
  } else if (
    session.tab &&
    !(session.get('prefill.method') && session.get('theme.hide_topbar'))
  ) {
    session.back();
  } else {
    if (CheckoutBridge && _.isFunction(CheckoutBridge[callback])) {
      CheckoutBridge[callback]();
    }
  }
};
