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
import Razorpay, {
  RazorpayConfig,
  makeAuthUrl,
  makeUrl,
} from 'common/Razorpay';
import { internetExplorer, ajaxRouteNotSupported } from 'common/useragent';
import { isPowerWallet } from 'common/wallet';
import { checkPaymentAdapter } from 'payment/adapters';
import * as GPay from 'gpay';
import Analytics from 'analytics';

const isRazorpayFrame = _Str.startsWith(
  RazorpayConfig.api,
  `${location.protocol}//${location.hostname}`
);
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
    var cancelError = _.rzpError(strings.cancelMsg);
    var payment_id = this.payment_id;
    var razorpay = this.r;
    var eventData = {};

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
          } else {
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

  this.sdk_popup = params.sdk_popup;
  this.magic = params.magic;
  this.optional = params.optional || {};

  this.isMagicPayment =
    this.sdk_popup &&
    this.magic &&
    /^(card|emi)$/.test(data.method) &&
    !params.feesRedirect;

  this.magicPossible = this.isMagicPayment;

  const external = params.external || {};
  this.isExternalAmazonPayPayment = external.amazonpay;
  this.isExternalGooglePayPayment = external.gpay;

  // If this is a magic payment, set auth_type=3ds in order to not use api-based-otpelf.
  if (data && typeof data.auth_type === 'undefined' && this.isMagicPayment) {
    data.auth_type = '3ds';
  }

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
  this.gpay = params.gpay || params.tez; // params.tez is legacy

  var avoidPopup = false;

  /**
   * Avoid Popup if:
   * - Payment is made by Payment Request API (`params.gpay` or `params.tez` here)
   * - UPI QR or UPI is chosen inside checkout form
   * - PowerWallet is chosen & contact details are provided inside checkout form
   *
   * Enforce Popup if:
   * - Merchant is on customer fee bearer model
   */
  if (this.gpay) {
    avoidPopup = true;
  } else if (isRazorpayFrame) {
    /**
     * data needs to be present. absence of data = placeholder popup in
     * payment paused state
     */
    if (data) {
      if (data.method === 'wallet' && isPowerWallet(data.wallet)) {
        /* If contact or email are missing, we need to ask for it in popup */
        if (data.contact && (this.optional.email || data.email)) {
          avoidPopup = true;
        }
      }

      if (data.method === 'upi') {
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

  checkSdkPopup: function() {
    var data = this.data;

    if (this.sdk_popup) {
      window.onpaymentcancel = _Func.bind(onPaymentCancel, this);
    }

    if (this.isMagicPayment) {
      Analytics.track('magic_open_popup', {
        r: this.r,
      });
      window.CheckoutBridge.invokePopup(
        _Obj.stringify({
          content: encodeURIComponent(popupTemplate(this)),
          focus: false,
        })
      );

      return true;
    }
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

      if (!this.avoidPopup || (data.method === 'upi' && !isRazorpayFrame)) {
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
    this.data = _Obj.clone(data || this.data);
    formatPayment(this);

    let setCompleteHandler = _ => {
      this.complete
        |> _Func.bind(this)
        |> _Obj.setPropOf(window, 'onComplete')
        |> pollPaymentData;
    };

    const isExternalSDKPayment =
      this.isExternalAmazonPayPayment || this.isExternalGooglePayPayment;

    if (isExternalSDKPayment) {
      setCompleteHandler();

      var provider;
      if (this.isExternalAmazonPayPayment) {
        provider = 'amazonpay';
      } else if (this.isExternalGooglePayPayment) {
        provider = 'googlepay';
      }

      Analytics.track('externalsdk:called', {
        provider: provider,
      });

      return window.setTimeout(() => {
        this.emit('externalsdk.process', this.data);
      }, 100);
    }

    if (this.shouldPopup() && !this.popup && this.r.get('callback_url')) {
      this.r.set('redirect', true);
    }

    // redirect if specified
    if (!this.checkSdkPopup() && this.checkRedirect()) {
      return;
    }

    // show loading screen in popup
    this.writePopup();

    if (!this.tryAjax()) {
      this.trySubmit();
    }

    // adding listeners
    if ((isRazorpayFrame && !this.avoidPopup) || this.isMagicPayment) {
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

    if (data.action === 'TOPUP') {
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

    if (this.sdk_popup) {
      window.onpaymentcancel = null;
    }
    if (this.isMagicPayment) {
      window.handleRelay = null;
    }
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

    // type: otp is not handled on razorpayjs
    // which is sent for some of the wallets, unidentifiable from
    // checkout side before making the payment
    // so not making ajax call for any wallet
    if (
      !isRazorpayFrame &&
      _Arr.contains(['wallet', 'cardless_emi'], data.method)
    ) {
      return;
    }

    if (!this.avoidPopup && !isRazorpayFrame && data.method === 'upi') {
      return;
    }

    // iphone background ajax route
    if (!this.iframe && !this.avoidPopup && ajaxRouteNotSupported) {
      return;
    }

    if (data.method === 'wallet' && !(data.contact && data.email)) {
      return;
    }
    // else make ajax request

    var razorpayInstance = this.r;

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
      _Doc.submitForm(makeRedirectUrl(payment.fees), data, 'post', popup.name);
    }
  },

  gotoBank: function() {
    if (!this.popup) {
      this.makePopup();
    }
    const isIframe = this.popup instanceof Iframe;
    if (isIframe) {
      this.popup.write(popupTemplate(this));
    }
    _Doc.submitForm(this.gotoBankUrl, null, 'post', this.popup.name);
    if (isIframe) {
      this.popup.show();
    }
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

    if (timeout) {
      timeoutId = setTimeout(() => {
        if (responded) {
          return;
        }

        responded = true;

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

        if (responded) {
          return;
        }

        responded = true;

        if (response.success || response.error) {
          if (response.success) {
            vpaCache[vpa] = response;
          }

          Analytics.track('validate:vpa:valid', {
            data: eventData,
          });

          resolve(response);
        } else {
          vpaCache[vpa] = response;

          Analytics.track('validate:vpa:invalid', {
            data: eventData,
          });
          reject(response);
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
    callback: function(response) {
      var request = response.request;
      if (isRedirect && !response.error && request) {
        _Doc.redirect({
          url: request.url,
          content: request.content,
          method: request.method || 'post',
        });
      } else {
        processCoproto.call(payment, response);
      }
    },
  });
};

export function createFees(data, razorpayInstance, onSuccess, onError) {
  data = formatPayload(data, razorpayInstance);

  fetch.post({
    url: makeUrl('payments/create/fees'),
    data,
    callback: function(response) {
      if (response.error) {
        return onError(response);
      } else {
        return onSuccess(response);
      }
    },
  });
}

/**
 * Cache store for flows.
 */
var flowCache = {
  card: {},
};

/**
 * Fetches card flows from cache.
 * @param {String} cardNumber
 *
 * @return {Object/undefined}
 */
export function getCardFlowsFromCache(cardNumber = '') {
  cardNumber = cardNumber.replace(/\D/g, '');

  if (cardNumber.length < 6) {
    return;
  }

  const iin = cardNumber.slice(0, 6);

  const flows = flowCache.card[iin];

  if (flows) {
    Analytics.track('flows:card:fetch:success', {
      data: {
        iin,
        cache: true,
      },
    });
  }

  return flows;
}

/**
 * Gets the flows associated with a card.
 * @param {string} cardNumber
 * @param {Function} callback
 */
razorpayProto.getCardFlows = function(cardNumber = '', callback = _Func.noop) {
  // Sanitize
  cardNumber = cardNumber.replace(/\D/g, '');

  if (cardNumber.length < 6) {
    callback({});
    return;
  }

  // Check cache.
  const fromCache = getCardFlowsFromCache(cardNumber);

  if (fromCache) {
    callback(fromCache);
    return;
  }

  const iin = cardNumber.slice(0, 6);
  let url = makeAuthUrl(this, 'payment/flows');

  // append IIN and source as query to flows route
  url = _.appendParamsToUrl(url, {
    iin,
    '_[source]': Track.props.library,
  });

  Analytics.track('flows:card:fetch:start', {
    data: {
      iin,
    },
  });

  fetch.jsonp({
    url,
    callback: flows => {
      if (flows.error) {
        Analytics.track('flows:card:fetch:failure', {
          data: {
            iin,
            error: flows.error,
          },
        });

        return;
      }

      // Add to cache.
      flowCache.card[iin] = flows;

      Analytics.track('flows:card:fetch:success', {
        data: {
          iin,
          flows,
        },
      });

      // Invoke callback.
      callback(flowCache.card[iin]);
    },
  });
};
