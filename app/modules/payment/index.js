import {
  processPaymentCreate,
  processCoproto,
  processOtpResponse,
} from 'payment/coproto';

import * as cookie from 'lib/cookie';
import * as Color from 'lib/color';
import * as strings from 'common/strings';

import Track from 'tracker';
import popupTemplate from 'payment/popup/template';
import Popup from 'payment/popup';
import Redir from 'payment/redir';
import Iframe from 'payment/iframe';
import { formatPayment, formatPayload } from 'payment/validator';
import { formatAmountWithSymbol } from 'common/currency';
import { FormatDelegator } from 'formatter';
import Razorpay, { makeAuthUrl, makeUrl } from 'common/Razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import { internetExplorer, ajaxRouteNotSupported } from 'common/useragent';
import { isPowerWallet } from 'common/wallet';
import { checkPaymentAdapter } from 'payment/adapters';
import * as GPay from 'gpay';
import Analytics from 'analytics';
import { isProviderHeadless } from 'common/cardlessemi';
import { updateCurrencies, setCurrenciesRate } from 'common/currency';
import { GOOGLE_PAY_PACKAGE_NAME } from 'common/upi';
import { getCardEntityFromPayload, getCardFeatures } from 'common/card';

/**
 * Tells if we're being executed from
 * the same domain as the configured API
 */
const isRazorpayFrame = () => {
  return _Str.startsWith(
    RazorpayConfig.api,
    `${location.protocol}//${location.hostname}`
  );
};

const RAZORPAY_COLOR = '#528FF0';
var pollingInterval;

let createdPaymentsCount = 0;

function clearPollingInterval(force) {
  if (force || pollingInterval) {
    cookie.unset('onComplete');
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function onPaymentCancel(metaParam) {
  if (!this.done) {
    var cancelError = {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment processing cancelled by user',
      },
    };
    var payment_id = this.payment_id;
    var razorpay = this.r;
    var eventData = {};
    var metadata = this.getMetadata();
    if (metadata) {
      cancelError.error.metadata = metadata;
    }

    if (payment_id) {
      eventData.payment_id = payment_id;
      var url = makeAuthUrl(razorpay, 'payments/' + payment_id + '/cancel');
      if (_.isNonNullObject(metaParam)) {
        url += '&' + _.obj2query(metaParam);
      }
      fetch({
        url: url,
        callback: response => {
          if (response.razorpay_payment_id) {
            Analytics.track('cancel_success', {
              data: response,
              r: razorpay,
            });
          } else if (!response.error) {
            response = cancelError;
          }
          this.complete(response);
        },
      });
    } else {
      this.complete(cancelError);
    }

    Analytics.track('cancel', {
      data: eventData,
      r: razorpay,
    });
  }
}

function getTrackingData(data) {
  // donottrack card number, token, cvv
  return (
    data
    |> _Obj.clone
    |> _Obj.loop(
      (val, key, o) => key.slice(0, 4) === 'card' && _Obj.deleteProp(o, key)
    )
  );
}

function trackNewPayment(data, params, r) {
  if (!data) {
    data = {};
  }
  /**
   * Set whether saved card is global or local.
   */
  if (data.token && r && r.preferences) {
    if (!_.isNonNullObject(params.saved_card)) {
      params.saved_card = {};
    }
    params.saved_card.mode = r.preferences.global ? 'global' : 'local';
  }

  /**
   * Set @xyz part of VPA.
   */
  if (data.method && data.method === 'upi' && data.vpa) {
    if (!_.isNonNullObject(params.upi)) {
      params.upi = {};
    }

    if (_Str.contains(data.vpa, '@')) {
      params.upi.provider = data.vpa.split('@')[1];
    }
  }

  Analytics.track('submit', {
    data: {
      data: getTrackingData(data),
      params: params,
      count: createdPaymentsCount,
    },
    r,
    immediately: true,
  });
}

export default function Payment(data, params = {}, r) {
  createdPaymentsCount++;

  this.iframe = params.iframe;
  this.nativeotp = params.nativeotp;

  this._time = _.now();

  this.optional = params.optional || {};

  params.feesRedirect = params.fees || params.feesRedirect; // params.fees has to be present for backward compatibility

  const external = params.external || {};
  this.isExternalAmazonPayPayment = external.amazonpay;
  this.isExternalGooglePayPayment = external.gpay;

  // track data, params. we only track first 6 digits of card number, and remove cvv,expiry.
  trackNewPayment(data, params, r);

  // saving razorpay instance
  this.r = r;

  // payment will be validated when resumed. So it's possible to have invalid arguments till it's paused
  this.on('cancel', onPaymentCancel);

  // Set the UPI app to use.
  if (data && data.upi_app) {
    this.upi_app = data.upi_app;
    delete data.upi_app;
  }

  this.feesRedirect = params.feesRedirect;
  this.microapps = params.microapps;
  this.gpay =
    params.gpay || params.tez || (this.microapps && this.microapps.gpay); // params.tez is legacy

  if (this.microapps && this.microapps.gpay) {
    Analytics.setMeta('microapps.gpay', true);
  }

  var avoidPopup = false;

  /**
   * Avoid Popup if:
   * - This is a native OTP request
   * - Payment is made by Payment Request API (`params.gpay` or `params.tez` here)
   * - UPI QR or UPI is chosen inside checkout form
   * - PowerWallet is chosen & contact details are provided inside checkout form
   *
   * Enforce Popup if:
   * - Merchant is on customer fee bearer model
   */
  if (this.nativeotp) {
    avoidPopup = true;
  } else if (this.gpay) {
    avoidPopup = true;
  } else if (data) {
    /**
     * data needs to be present. absence of data = placeholder popup in
     * payment paused state
     */
    if (data.application || data.method === 'app') {
      // Obviously avoid popup if paying with an external application
      avoidPopup = true;
      if (data.provider === 'cred' && !data.app_present && !isRazorpayFrame()) {
        // CRED collect flow for razorpay.js
        avoidPopup = false;
      }
    } else if (data.application || data.method === 'app') {
      // Obviously avoid popup if paying with an external application
      avoidPopup = true;
    }

    if (isRazorpayFrame()) {
      if (data.method === 'wallet') {
        if (isPowerWallet(data.wallet)) {
          /* If contact or email are missing, we need to ask for it in popup */
          if (data.contact && data.email) {
            avoidPopup = true;
          }
        }

        if (data['_[flow]'] === 'intent') {
          avoidPopup = true;
        }
      }

      if (data.method === 'upi') {
        avoidPopup = true;
      }

      /**
       * Show popup if:
       * - Contact is missing
       */
      if (data.provider === 'epaylater' && data.contact) {
        avoidPopup = true;
      }

      /**
       * Show Popup for Cardless EMI, if
       * - Contact is absent.
       * - emi_duration is present but provider is not headless
       */
      if (data.method === 'cardless_emi') {
        if (!data.contact) {
          avoidPopup = false;
        } else {
          if (data.emi_duration) {
            avoidPopup = isProviderHeadless(data.provider);
          } else {
            avoidPopup = true;
          }
        }
      }

      /**
       * We do not want to show the popup
       * if the user is trying to make a
       * Paper Nach submission
       */
      if (data.method === 'nach') {
        avoidPopup = true;
      }

      /* If fees is there, we need to show fee view in poupup */
      if (params.feesRedirect) {
        avoidPopup = false;
      }

      /* avoid popup for UPI QR anyway, fee bearer screen handled for this */
      if (params.upiqr) {
        avoidPopup = true;
      }
    }
  }

  this.avoidPopup = avoidPopup;
  this.message = params.message;

  this.tryPopup();

  if (params.paused) {
    try {
      this.writePopup();
    } catch (e) {}
    this.data = data;
    this.on('resume', _Func.bind('generate', this));
  } else {
    this.generate(data);
  }
}

Payment.prototype = {
  on: function(event, handler) {
    return this.r.on('payment.' + event, _Func.bind(handler, this));
  },

  emit: function(event, arg) {
    this.r.emit('payment.' + event, arg);
  },

  off: function() {
    this.r.off('payment');
  },

  checkRedirect: function() {
    var getOption = this.r.get;

    if (!this.iframe && getOption('redirect')) {
      var data = this.data;
      // add callback_url if redirecting
      var callback_url = getOption('callback_url');
      if (callback_url) {
        data.callback_url = callback_url;
      }

      if (!this.avoidPopup || (data.method === 'upi' && !isRazorpayFrame())) {
        _Doc.redirect({
          url: makeRedirectUrl(this.feesRedirect),
          content: data,
          method: 'post',
          target: getOption('target'),
        });
        return true;
      }
    }
  },

  generate: function(data) {
    // Append `data` to `this.data`
    this.data = _Obj.extend(
      _Obj.clone(this.data || {}),
      _Obj.clone(data || {})
    );

    if (this.gpay || this.tez) {
      if (data['_[app]'] === GOOGLE_PAY_PACKAGE_NAME) {
        if (
          !(
            this.r.paymentAdapters &&
            (this.r.paymentAdapters[GOOGLE_PAY_PACKAGE_NAME] ||
              this.r.paymentAdapters['microapps.gpay'])
          )
        ) {
          return this.r.emit(
            'payment.error',
            _.rzpError('GPay is not available')
          );
        }
      }
    }

    formatPayment(this);

    let setCompleteHandler = _ => {
      this.complete
        |> _Func.bind(this)
        |> _Obj.setPropOf(window, 'onComplete')
        |> pollPaymentData;
    };

    const isExternalSDKPayment =
      this.isExternalAmazonPayPayment || this.isExternalGooglePayPayment;

    const isGooglePayCards =
      this.isExternalGooglePayPayment && this.data.method === 'card';
    // Fire external SDK payment process event.
    // Avoid if it's a Google Pay Cards payment as
    // we will fire this event after creating the payment on API.

    if (isExternalSDKPayment && !isGooglePayCards) {
      setCompleteHandler();

      return window.setTimeout(() => {
        this.emit('externalsdk.process', this.data);
      }, 100);
    }

    if (this.shouldPopup() && !this.popup && this.r.get('callback_url')) {
      this.r.set('redirect', true);
    }

    // redirect if specified
    if (this.checkRedirect()) {
      return;
    }

    // show loading screen in popup
    this.writePopup();

    if (!this.tryAjax()) {
      this.trySubmit();
    }

    // adding listeners
    if (isRazorpayFrame() && !this.avoidPopup) {
      setCompleteHandler();
    }
    this.offmessage = global |> _El.on('message', _Func.bind(onMessage, this));
  },

  complete: function(data) {
    if (this.done) {
      return;
    }

    if (typeof data !== 'object') {
      data = JSON.parse(data);
    }

    if (data._time) {
      if (data._time < this._time) {
        return;
      }
      delete data._time;
    }

    if (data.error && data.error.action === 'TOPUP') {
      return processOtpResponse.call(this, data);
    }

    this.clear();

    if (data.razorpay_payment_id) {
      // Track
      Analytics.track('oncomplete', {
        r: this.r,
        data: _Obj.clone(data),
      });
      this.emit('success', data);
    } else {
      var errorObj = data.error;
      if (!_.isNonNullObject(errorObj) || !errorObj.description) {
        if (data.request) {
          if (processCoproto.call(this, data)) {
            return;
          }
        }
        data = _.rzpError('Payment failed');
      }
      if (data.xhr) {
        Analytics.track('ajax_error', data);
      }
      this.emit('error', data);
    }

    this.off();
  },

  clear: function() {
    try {
      this.popup.onClose = null;
      this.popup.close();
    } catch (e) {}

    this.done = true;

    // unbind listener
    if (this.offmessage) {
      this.offmessage();
    }

    clearPollingInterval();

    this.r._payment = null;

    if (this.ajax) {
      this.ajax.abort();
    }
  },

  tryAjax: function() {
    var data = this.data;
    // virtually all the time, unless there isn't an ajax based route
    if (this.feesRedirect) {
      return;
    }

    // no ajax route for simpl/icici
    if (data.method === 'paylater') {
      if (data.provider === 'getsimpl' || data.provider === 'icic') {
        return;
      }
    }

    /**
     * type: otp is not handled on razorpayjs
     * which is sent for some of the wallets, unidentifiable from
     * checkout side before making the payment
     * so not making ajax call for power wallets
     */
    const popupForMethods = ['cardless_emi'];
    const paymentThroughPowerWallet =
      data.method === 'wallet' && isPowerWallet(data.wallet);
    if (
      !isRazorpayFrame() && // razorpay.js
      (_Arr.contains(popupForMethods, data.method) || paymentThroughPowerWallet)
    ) {
      return;
    }

    if (!this.avoidPopup && !isRazorpayFrame() && data.method === 'upi') {
      return;
    }

    // CRED collect flow for razorpay.js
    if (
      !this.avoidPopup &&
      !isRazorpayFrame() &&
      data.method === 'app' &&
      data.provider === 'cred' &&
      !data.app_present
    ) {
      return;
    }

    // iphone background ajax route
    if (!this.iframe && !this.avoidPopup && ajaxRouteNotSupported) {
      return;
    }

    if (data.method === 'wallet' && !(data.contact && data.email)) {
      return;
    }

    // Axis bank requires HTTP Referer field to be non-empty,
    // If opening bank page from popup, it will be empty.
    // So use create/checkout route.
    if (data.method === 'emandate' && data.bank === 'UTIB') {
      return;
    }
    //Use create/checkout route when auth_type is not passed,
    // at the time of payment creation payload for emandate.
    if (data.method === 'emandate' && !data.auth_type) {
      return;
    }

    // else make ajax request

    var razorpayInstance = this.r;

    data['_[request_index]'] = Analytics.updateRequestIndex('submit');

    this.ajax = fetch.post({
      url: makeUrl('payments/create/ajax'),
      data,
      callback: _Func.bind(processPaymentCreate, this),
    });
    return 1;
  },

  trySubmit: function() {
    var payment = this;
    var popup = payment.popup;

    // no ajax route was available
    if (popup) {
      var data = payment.data;

      // fix long notes
      _Obj.loop(data, (val, key) => {
        if (/^notes/.test(key) && _.lengthOf(val) > 200) {
          data[key] = val.replace(/\n/g, ' ');
        }
      });
      if (this.iframe) {
        this.popup.show();
      }

      data['_[request_index]'] = Analytics.updateRequestIndex('submit');

      _Doc.submitForm(makeRedirectUrl(payment.fees), data, 'post', popup.name);
    }
  },

  redirect: function({ url, content, method = 'get' }) {
    // If we're in SDK and not in an iframe, redirect directly
    // Not using Bridge.hasCheckoutBridge since bridge.js imports session
    if (global.CheckoutBridge) {
      _Doc.submitForm(url, content, method);
    }
    // Otherwise, use sendMessage
    else {
      Razorpay.sendMessage({
        event: 'redirect',
        data: {
          url,
          method,
          content,
        },
      });
    }
  },

  gotoBank: function() {
    if (this.gotoBankRequest) {
      this.gotoBankUsingRequest();
    } else if (this.gotoBankHtml) {
      this.gotoBankUsingHtml();
    } else if (this.gotoBankUrl) {
      this.gotoBankUsingUrl();
    }
  },

  gotoBankUsingUrl: function() {
    if (this.r.get('redirect')) {
      // For redirect mode where we do not have a popup, redirect using POST
      this.redirect({ url: this.gotoBankUrl, method: 'post' });
    } else {
      // Create popup if it doesn't exist.
      if (!this.popup) {
        this.makePopup();
      }
      // Show loading UI in popup till the bank page loads.
      this.writePopup();
      // Open bank url in the popup
      _Doc.submitForm(this.gotoBankUrl, null, 'post', this.popup.name);
    }
  },

  gotoBankUsingHtml: function() {
    // Create popup if it doesn't exist.
    if (!this.popup) {
      this.makePopup();
    }
    // In type: first JSON response, we get HTML page which redirects to bank.
    // Write HTML into popup.
    this.popup.write(this.gotoBankHtml);
  },

  gotoBankUsingRequest: function() {
    // Create popup if it doesn't exist.
    if (!this.popup) {
      this.makePopup();
    }
    // In type: first JSON response, we got request data.
    // Append form into popup and submit.
    const request = this.gotoBankRequest;
    _Doc.submitForm(
      request.url,
      request.content,
      request.method,
      this.popup.name
    );
  },

  makePopup: function() {
    let Medium = Popup;
    if (this.iframe) {
      Medium = Iframe;
    }
    var popup = new Medium('', 'popup_' + Track.id, this);
    if ((popup && !popup.window) || popup.window.closed !== false) {
      popup.close();
      popup = null;
    }

    if (popup) {
      popup.onClose = this.r.emitter('payment.cancel');
    }
    this.popup = popup;
    return popup;
  },

  writePopup: function() {
    var popup = this.popup;
    if (popup) {
      popup.write(popupTemplate(this));
      popup.window.deserialize = _Doc.obj2formhtml;
    }
  },

  shouldPopup: function() {
    if (this.iframe) {
      return true;
    }

    if (this.nativeotp) {
      return false;
    }

    return !(this.r.get('redirect') || this.avoidPopup);
  },

  tryPopup: function() {
    if (this.shouldPopup()) {
      this.makePopup();
    }
  },

  getMetadata: function() {
    const metadata = {};
    if (this.payment_id) {
      metadata.payment_id = this.payment_id;
      if (this.r.get('order_id')) {
        metadata.order_id = this.r.get('order_id');
      }
      return metadata;
    }
  },
};

function pollPaymentData(onComplete) {
  clearPollingInterval(true);
  pollingInterval = setInterval(function() {
    var paymentData = cookie.get('onComplete');

    if (paymentData) {
      clearPollingInterval();
      onComplete(paymentData);
    }
  }, 150);
}

function onMessage(e) {
  if (this.popup && this.popup.window === e.source) {
    this.complete(e.data);
  }
}

function makeRedirectUrl(fees) {
  return makeUrl('payments/create/' + (fees ? 'fees' : 'checkout'));
}

Razorpay.setFormatter = FormatDelegator;

var razorpayProto = Razorpay.prototype;

/**
 * Method to check if a payment adapter is present.
 * @param {String} adapter
 * @param {Object} data
 *
 * @return {Promise}
 */
razorpayProto.checkPaymentAdapter = function(adapter, data) {
  return checkPaymentAdapter(adapter, data).then(success => {
    if (!this.paymentAdapters) {
      this.paymentAdapters = {};
    }

    this.paymentAdapters[adapter] = true;

    return Promise.resolve(success);
  });
};

/**
 * [LEGACY]
 * Method to check if Tez is installed on Device
 * @param {Function} successCallback
 * @param {Function} errorCallback
 */
razorpayProto.isTezAvailable = function(success, error) {
  this.checkPaymentAdapter('gpay')
    .then(success)
    .catch(error);
};

razorpayProto.postInit = function() {
  var themeColor = this.get('theme.color') || RAZORPAY_COLOR;

  this.themeMeta = {
    color: themeColor,
    textColor: Color.isDark(themeColor) ? '#FFFFFF' : 'rgba(0, 0, 0, 0.85)',
    highlightColor: Color.getHighlightColor(themeColor, RAZORPAY_COLOR),
  };
};

razorpayProto.createPayment = function(data, params) {
  if (data && 'data' in data) {
    data = data.data;
    params = data;
  }
  if (!_.isNonNullObject(params)) {
    params = {};
  }

  this._payment = this._payment || new Payment(data, params, this);
  return this;
};

/**
 * Cache for attempted VPAs.
 */
let vpaCache = {};

razorpayProto.verifyVpa = function(vpa = '', timeout = 0) {
  const eventData = {
    vpa,
    timeout,
  };

  const url = makeAuthUrl(this, 'payments/validate/account');
  const cachedVpaResponse = vpaCache[vpa];

  if (cachedVpaResponse) {
    const cachedEventData = _Obj.extend(
      {
        cache: true,
      },
      eventData
    );

    if (cachedVpaResponse.success) {
      Analytics.track('validate:vpa:valid', {
        data: cachedEventData,
      });

      return Promise.resolve(cachedVpaResponse);
    } else {
      Analytics.track('validate:vpa:invalid', {
        data: cachedEventData,
      });

      return Promise.reject(cachedVpaResponse);
    }
  }

  return new Promise((resolve, reject) => {
    let timeoutId;
    let responded = false;
    const timer = _.timer();

    Analytics.track('validate:vpa:init', {
      data: eventData,
    });

    if (timeout) {
      timeoutId = setTimeout(() => {
        if (responded) {
          return;
        }

        responded = true;
        eventData.time = timer();

        Analytics.track('validate:vpa:timeout', {
          data: eventData,
        });

        resolve();
      }, timeout);
    }

    const response = fetch.post({
      url,
      data: {
        entity: 'vpa',
        value: vpa,
      },
      callback: function(response) {
        clearInterval(timeoutId);

        // Track that we got a response
        Analytics.track('validate:vpa:response', {
          data: {
            time: timer(),
          },
        });

        if (responded) {
          return;
        }

        responded = true;
        eventData.time = timer();

        /**
         * Consider VPA to be invalid only if API says it is invalid
         * response.error would exist even if it's a network error
         */
        const isVpaInvalid =
          response.success === false ||
          (response.error && response.error.field === 'vpa');

        if (isVpaInvalid) {
          vpaCache[vpa] = response;

          Analytics.track('validate:vpa:invalid', {
            data: eventData,
          });

          reject(response);
        } else {
          /**
           * We can enter this flow for a failed n/w request as well
           * as for a success
           * but we should cache only if it is a success
           */
          if (response.success) {
            vpaCache[vpa] = response;
          }

          Analytics.track('validate:vpa:valid', {
            data: eventData,
          });

          resolve(response);
        }
      },
    });
  });
};

razorpayProto.focus = function() {
  try {
    this._payment.popup.window.focus();
  } catch (e) {}
};

razorpayProto.submitOTP = function(otp) {
  var payment = this._payment;
  payment.ajax = fetch.post({
    url: payment.otpurl,
    data: {
      type: 'otp',
      otp: otp,
    },
    callback: _Func.bind(processOtpResponse, payment),
  });
};

razorpayProto.resendOTP = function(callback) {
  var payment = this._payment;
  payment.ajax = fetch.post({
    url: makeAuthUrl(this, 'payments/' + payment.payment_id + '/otp_resend'),
    data: {
      '_[source]': 'checkoutjs',
    },
    callback: _Func.bind(processCoproto, payment),
  });
};

razorpayProto.topupWallet = function() {
  var payment = this._payment;
  var isRedirect = this.get('redirect');
  if (!isRedirect) {
    payment.makePopup();
    payment.writePopup();
  }

  payment.ajax = fetch.post({
    url: makeAuthUrl(this, 'payments/' + payment.payment_id + '/topup/ajax'),
    data: {
      '_[source]': 'checkoutjs',
    },
    callback: response => {
      var request = response.request;
      if (isRedirect && !response.error && request) {
        _Doc.redirect({
          url: request.url,
          content: request.content,
          method: request.method || 'post',
          target: this.get('target'),
        });
      } else {
        processCoproto.call(payment, response);
      }
    },
  });
};

/**
 * Returns card currencies from cache
 *
 * @param payload Payload which contains either Card Number, IIN or Token.
 */
export function getCardCurrenciesFromCache(payload) {
  const entity = getCardEntityFromPayload(payload);
  return CardCurrencyCache[entity] || {};
}

/**
 * Store ongoing currency request
 */
var CardCurrencyRequests = {};

/**
 * Currency cache for synchronous retrieval
 */
var CardCurrencyCache = {};

/**
 * [DEPRECATED]
 * This method exists on the prototype only because
 * it had been exposed to merchants previously.
 *
 * Gets the flows associated with a card.
 * @param {string} cardNumber
 * @param {Function} callback
 */
razorpayProto.getCardFlows = function(cardNumber = '', callback = _Func.noop) {
  getCardFeatures(cardNumber)
    .then(({ flows = {} }) => {
      callback(flows);
    })
    .catch(() => {
      callback({});
    });
};

razorpayProto.getCardFeatures = getCardFeatures;

/**
 * Gets the currencies associated with a card.
 * @param payload Payload which contains amount, currency and either Card Number, IIN or Token
 * @returns {*}
 */
razorpayProto.getCardCurrencies = function(payload) {
  const requestPayload = {
    '_[source]': Track.props.library,
  };

  const entity = getCardEntityFromPayload(payload);
  if (entity.length === 6) {
    requestPayload.iin = entity;
  } else {
    requestPayload.token = entity;
  }

  const { amount, currency } = payload;
  if (amount && currency) {
    requestPayload.amount = amount;
    requestPayload.currency = currency;
  }

  const existingRequest = CardCurrencyRequests[entity];
  if (existingRequest) {
    return existingRequest;
  }

  CardCurrencyRequests[entity] = new Promise((resolve, reject) => {
    let url = makeAuthUrl(this, 'payment/flows');

    // append requestPayload
    url = _.appendParamsToUrl(url, requestPayload);

    fetch.jsonp({
      url,
      callback: response => {
        if (response.error) {
          Analytics.track('currencies:card:fetch:failure', {
            data: {
              entity,
              error: response.error,
            },
          });
          return reject(response.error);
        }

        if (response.all_currencies) {
          updateCurrencies(response.all_currencies);
          setCurrenciesRate(response.all_currencies, amount);
        }

        // Store in cache
        CardCurrencyCache[entity] = response;

        // Resolve
        resolve(response);

        Analytics.track('currencies:card:fetch:success', {
          data: {
            entity,
          },
        });
      },
    });

    Analytics.track('currencies:card:fetch:start', {
      data: {
        entity,
      },
    });
  });

  return CardCurrencyRequests[entity];
};
