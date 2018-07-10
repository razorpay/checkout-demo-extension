import getFingerprint from './fingerprint';
import * as Tez from './tez';
import * as cookie from 'lib/cookie';
import * as Formatter from './formatter';
import jsonp from 'lib/jsonp';

var pollingInterval;

function clearPollingInterval(force) {
  if (force || pollingInterval) {
    cookie.unset('onComplete');
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

var communicator;
function setCommunicator() {
  if (!discreet.isFrame && (isWP || /MSIE |Trident\//.test(ua))) {
    _El.create('iframe')
      |> _El.displayNone
      |> _El.appendTo(_Doc.documentElement)
      |> _Obj.setProp('src', RazorpayConfig.api + 'communicator.php');
  }
}
setCommunicator();

function submitPopup(payment) {
  var popup = payment.popup;
  var data = payment.data;

  // fix long notes
  _Obj.loop(data, (val, key) => {
    if (/^notes/.test(key) && _.lengthOf(val) > 200) {
      data[key] = val.replace(/\n/g, ' ');
    }
  });

  // no ajax route was available
  if (popup) {
    _Doc.submitForm(makeRedirectUrl(payment.fees), data, 'post', popup.name);
  }
}

function onPaymentCancel(metaParam) {
  if (!this.done) {
    var cancelError = discreet.error();
    var payment_id = this.payment_id;
    var razorpay = this.r;
    var eventData = {};

    if (payment_id) {
      eventData.payment_id = payment_id;
      var url = makeAuthUrl(razorpay, 'payments/' + payment_id + '/cancel');
      if (_.isNonNullObject(metaParam)) {
        url += _.obj2query(metaParam);
      }
      fetch({
        url: url,
        callback: response => {
          if (response.razorpay_payment_id) {
            Track(razorpay, 'cancel_success', response);
          } else {
            response = cancelError;
          }
          this.complete(response);
        },
      });
    } else {
      this.complete(cancelError);
    }

    // Set auth_type in case of Debit + PIN.
    if (this.isDebitPin) {
      eventData.auth_type = this.debitPinAuthType;
    }

    Track(razorpay, 'cancel', eventData);
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
  Track(r, 'submit', {
    data: getTrackingData(data),
    params: params,
  });
}

export default function Payment(data, params, r) {
  this._time = _.now();

  this.sdk_popup = params.sdk_popup;
  this.magic = params.magic;

  this.isMagicPayment =
    this.sdk_popup && this.magic && /^(card|emi)$/.test(data.method);

  this.magicPossible = this.isMagicPayment;

  if (r.get('key') !== 'rzp_live_ChO9QOhE7BH1aD') {
    this.isMagicPayment = this.isMagicPayment && Math.random() < 0.1;
  }

  this.isDebitPin =
    data.auth_type && (data.auth_type === '3ds' || data.auth_type === 'pin');
  if (this.isDebitPin) {
    this.debitPinAuthType = data.auth_type;
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

  this.fees = params.fees;
  this.tez = params.tez;

  this.powerwallet =
    params.powerwallet || (data && data.method === 'upi' && !params.fees);
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
      window.onpaymentcancel = bind(onPaymentCancel, this);
    }

    if (this.isMagicPayment) {
      Track(this.r, 'magic_open_popup');
      window.CheckoutBridge.invokePopup(
        _Obj.stringify({
          content: templates.popup(this),
          focus: false,
        })
      );

      return true;
    }
  },

  checkRedirect: function() {
    var getOption = this.r.get;

    if (getOption('redirect')) {
      var data = this.data;
      // add callback_url if redirecting
      var callback_url = getOption('callback_url');
      if (callback_url) {
        data.callback_url = callback_url;
      }

      if (!this.powerwallet || (data.method === 'upi' && !discreet.isFrame)) {
        discreet.redirect({
          url: makeRedirectUrl(this.fees),
          content: data,
          method: 'post',
          target: getOption('target'),
        });
        return true;
      }
    }
  },

  format: function() {
    var data = this.data;

    // Set view for fees.
    if (this.fees) {
      data.view = 'html';
    }

    // fill data from options if empty
    var getOption = this.r.get;
    each(
      [
        'amount',
        'currency',
        'signature',
        'description',
        'order_id',
        'account_id',
        'notes',
        'subscription_id',
        'payment_link_id',
        'customer_id',
        'recurring',
        'subscription_card_change',
        'recurring_token.max_amount',
        'recurring_token.expire_by',
      ],
      function(i, field) {
        if (!(field in data)) {
          var val = getOption(field);
          if (val) {
            data[field.replace(/\.(\w+)/g, '[$1]')] = val;
          }
        }
      }
    );

    var key_id = getOption('key');
    if (!data.key_id && key_id) {
      data.key_id = key_id;
    }

    // api needs this flag to decide between redirect/otp
    if (this.powerwallet && data.method === 'wallet') {
      data['_[source]'] = 'checkoutjs';
    }

    let fingerprint = getFingerprint();
    if (fingerprint) {
      data['_[shield][fhash]'] = fingerprint;
    }

    data['_[shield][tz]'] = -(new Date().getTimezoneOffset());

    // flatten notes, card
    // notes.abc -> notes[abc]
    flattenProp(data, 'notes', '[]');
    flattenProp(data, 'card', '[]');

    var expiry = data['card[expiry]'];
    if (isString(expiry)) {
      data['card[expiry_month]'] = expiry.slice(0, 2);
      data['card[expiry_year]'] = expiry.slice(-2);
      delete data['card[expiry]'];
    }

    // add tracking data
    data._ = Track.common();
    // make it flat
    flattenProp(data, '_', '[]');
  },

  generate: function(data) {
    this.data = clone(data || this.data);
    this.format();

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
      submitPopup(this);
    }

    // adding listeners
    if ((discreet.isFrame && !this.powerwallet) || this.isMagicPayment) {
      this.complete
        |> _Func.bind(this)
        |> _Obj.setPropOf(window, 'onComplete')
        |> pollPaymentData;
    }
    this.offmessage = global |> _El.on('message', _Func.bind(onMessage, this));
  },

  complete: function(data) {
    if (this.done) {
      return;
    }

    try {
      if (typeof data !== 'object') {
        data = JSON.parse(data);
      }
    } catch (e) {
      return roll('completed with ' + data, e);
    }

    if (data._time) {
      if (data._time < this._time) {
        return;
      }
      delete data._time;
    }

    if (data.action === 'TOPUP') {
      return invoke(otpCallback, this, data);
    }

    this.clear();

    if (data.razorpay_payment_id) {
      // Track
      Track(
        this.r,
        'oncomplete',
        _Obj.clone(data) |> _Obj.setProp('auth_type', this.debitPinAuthType)
      );
      this.emit('success', data);
    } else {
      var errorObj = data.error;
      if (!_.isNonNullObject(errorObj) || !errorObj.description) {
        if (data.request) {
          var func = responseTypes[data.type];
          if (typeof func === 'function') {
            return func.call(this, data.request);
          }
        }
        data = discreet.error('Payment failed');
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
    Razorpay.popup_delay = null;
    clearInterval(this.popup_track_interval);
    clearTimeout(this.ajax_delay);

    // unbind listener
    if (this.offmessage) {
      this.offmessage();
    }

    clearPollingInterval();
    abortAjax(this.ajax);
    this.r._payment = null;

    if (this.sdk_popup) {
      window.onpaymentcancel = null;
    }
    if (this.isMagicPayment) {
      window.handleRelay = null;
    }
  },

  tryAjax: function() {
    var data = this.data;
    // virtually all the time, unless there isn't an ajax based route
    if (this.fees) {
      return;
    }
    // or its cross domain ajax. in that case, let popup redirect for sake of IE
    if (
      !discreet.isFrame &&
      (/MSIE /.test(ua) ||
        data.wallet === 'payumoney' ||
        data.wallet === 'freecharge' ||
        data.wallet === 'olamoney')
    ) {
      return;
    }
    if (data.method === 'emandate') {
      return;
    }
    // iphone background ajax route
    if (!this.powerwallet && /iP(hone|ad)/.test(ua)) {
      return;
    }

    if (data.method === 'wallet' && !(data.contact && data.email)) {
      return;
    }
    // else make ajax request

    var razorpayInstance = this.r;
    var ajax_delay_timeout = 1e4; // 10s

    this.ajax_delay = setTimeout(function() {
      Track(razorpayInstance, 'ajax_delay', {
        delay: ajax_delay_timeout,
      });
    }, ajax_delay_timeout);

    Track(razorpayInstance, 'ajax');
    this.ajax = fetch.post({
      url: makeUrl('payments/create/ajax'),
      data,
      callback: _Func.bind(ajaxCallback, this),
    });
    return 1;
  },

  makePopup: function() {
    var popup = new Popup('', 'popup_' + Track.id);
    if ((popup && !popup.window) || popup.window.closed !== false) {
      popup.close();
      popup = null;
    }

    if (popup) {
      var timer = _.timer();

      Razorpay.popup_delay = () =>
        Track(this.r, 'popup_delay', {
          duration: timer(),
        });

      Razorpay.popup_track = () => {
        try {
          noop(this.popup.window.document);
        } catch (e) {
          error: e;
          clearInterval(this.popup_track_interval);
          Track(this.r, 'popup_acs', { duration: timer() });
        }
      };

      this.popup_track_interval = setInterval(Razorpay.popup_track, 99);
      popup.onClose = this.r.emitter('payment.cancel');
    }
    this.popup = popup;
    return popup;
  },

  writePopup: function() {
    var popup = this.popup;
    if (popup) {
      popup.write(templates.popup(this));
    }
  },

  shouldPopup: function() {
    return !(this.r.get('redirect') || this.powerwallet);
  },

  tryPopup: function() {
    if (this.shouldPopup()) {
      this.makePopup();
    }
  },
};

function ajaxCallback(response) {
  clearTimeout(this.ajax_delay);
  var payment_id = response.payment_id;
  if (payment_id) {
    this.payment_id = payment_id;
  }

  this.magicCoproto = response.magic || false;

  Track(this.r, 'ajax_response', response);

  var errorResponse = response.error;
  var popup = this.popup;

  // race between popup close poll and ajaxCallback. don't continue if payment has been canceled
  if (popup && popup.checkClose()) {
    return; // return if it's already closed
  }
  // if ajax call is blocked by ghostery or some other reason, fall back to redirection in popup
  if (errorResponse && response.xhr && response.xhr.status === 0) {
    if (popup) {
      submitPopup(this);
    }
    return Track(this.r, 'no_popup');
  }

  if (response.razorpay_payment_id || errorResponse) {
    this.complete(response);
  } else {
    var request = response.request;
    if (request && request.url && RazorpayConfig.frame) {
      request.url = request.url.replace(/^.+v1\//, makeUrl());
    }
    var func = responseTypes[response.type];
    if (typeof func === 'function') {
      func.call(this, request, response);
    }
  }
}

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
  if (
    (this.popup && this.popup.window === e.source) ||
    (communicator && communicator.contentWindow === e.source)
  ) {
    this.complete(e.data);
  }
}

function makeRedirectUrl(fees) {
  return makeUrl('payments/create/' + (fees ? 'fees' : 'checkout'));
}

var responseTypes = {
  // this === payment
  first: function(request, fullResponse) {
    var direct = request.method === 'direct';
    var content = request.content;
    var popup = this.popup;
    var coprotoMagic = fullResponse.magic ? fullResponse.magic : false;

    if (this.isMagicPayment) {
      this.r._payment.emit('magic.init');

      var popupOptions = {
        focus: !coprotoMagic,
        magic: coprotoMagic,
        otpelf: true,
      };

      if (direct) {
        popupOptions.content = content;
      } else {
        var url =
          "javascript: submitForm('" +
          request.url +
          "', " +
          _Obj.stringify(request.content) +
          ", '" +
          request.method +
          "')";
        popupOptions.url = url;
      }

      global.CheckoutBridge.invokePopup(_Obj.stringify(popupOptions));
    } else if (popup) {
      if (direct) {
        // direct is true for payzapp
        popup.write(content);
      } else {
        _Doc.submitForm(
          request.url,
          request.content,
          request.method,
          popup.window.name
        );
      }
      // popup blocking addons close popup once we set a url
      setTimeout(() => {
        if (popup.window.closed && this.r.get('callback_url')) {
          this.r.set('redirect', true);
          this.checkRedirect();
        }
      });
    }
  },

  async: function(request, fullResponse) {
    this.ajax = fetch({
      url: request.url,
      callback: response => this.complete(response),
    }).till(response => response && response.status);

    this.emit('upi.pending', fullResponse.data);
  },

  tez: function(coprotoRequest, fullResponse) {
    Tez.pay(
      fullResponse.data,
      instrument => {
        this.emit('upi.intent_response', {
          response: instrument.details,
        });
      },
      error => {
        if (error.code && error.code === error.ABORT_ERR) {
          this.emit('upi.intent_response', {});
        }

        Track(this.r, 'tez_error', error);
      }
    );
  },

  intent: function(request, fullResponse) {
    var self = this;
    var url = request.url;

    var upiBackCancel = {
      '_[method]': 'upi',
      '_[flow]': 'intent',
      '_[reason]': 'UPI_INTENT_BACK_BUTTON',
    };

    var ra = () =>
      fetch({
        url: request.url,
        callback: response => this.complete(response),
      }).till(response => response && response.status);

    this.emit('upi.coproto_response', request);

    var intent_url = (fullResponse.data || {}).intent_url;
    this.on('upi.intent_response', function(data) {
      if (isEmptyObject(data)) {
        return self.emit('cancel', upiBackCancel);
      } else if (data.response) {
        var response = {};

        if (_.isNonNullObject(data.response)) {
          response = data.response;
        } else {
          // Convert the string response into a JSON object.
          var split = data.response.split('&');
          for (var i = 0; i < split.length; i++) {
            var pair = split[i].split('=');
            if (
              pair[1] === '' ||
              pair[1] === 'undefined' ||
              pair[1] === 'null'
            ) {
              response[pair[0]] = null;
            } else {
              response[pair[0]] = pair[1];
            }
          }
        }

        if (!response.txnId) {
          return self.emit('cancel', upiBackCancel);
        }
      } else {
        self.emit('upi.pending', { flow: 'upi-intent', response: data });
      }
      self.ajax = ra();
    });

    var CheckoutBridge = window.CheckoutBridge;
    if (CheckoutBridge && CheckoutBridge.callNativeIntent) {
      // If there's a UPI App specified, use it.
      if (this.upi_app) {
        CheckoutBridge.callNativeIntent(intent_url, this.upi_app);
      } else {
        CheckoutBridge.callNativeIntent(intent_url);
      }
    } else if (ua_android_browser) {
      if (this.tez) {
        return responseTypes['tez'].call(this, request, fullResponse);
      }

      // Start Timeout
      var drawerTimeout = setTimeout(function() {
        /**
         * If upi app selection drawer not happened (technically,
         * checkout is not blurred until 3 sec)
         */
        self.emit('cancel', {
          '_[method]': 'upi',
          '_[flow]': 'intent',
          '_[reason]': 'UPI_INTENT_WEB_NO_APPS',
        });
        self.emit('upi.noapp');
      }, 3000);

      var blurHandler = function() {
        /**
         * If upi app selection drawer opened before 3 sec, clear timeout
         */
        clearTimeout(drawerTimeout);
        self.emit('upi.selectapp');
      };

      var focHandler = function() {
        self.emit('upi.pending', { flow: 'upi-intent' });

        window.removeEventListener('blur', blurHandler);
        window.removeEventListener('focus', focHandler);
        ra();
      };

      window.addEventListener('blur', blurHandler);
      window.addEventListener('focus', focHandler);

      window.location = fullResponse.data.intent_url;
    }
  },

  otp: function(request) {
    this.otpurl = request.url;
    this.emit('otp.required');
  },

  // prettier-ignore
  'return': function(request) {
    discreet.redirect(request);
  }
};

function otpCallback(response) {
  var error = response.error;
  if (error) {
    if (error.action === 'RETRY') {
      return this.emit('otp.required', discreet.msg.wrongotp);
    } else if (error.action === 'TOPUP') {
      return this.emit('wallet.topup', error.description);
    }
    this.complete(response);
  }
  ajaxCallback.call(this, response);
}

var razorpayProto = Razorpay.prototype;

razorpayProto.createPayment = function(data, params) {
  if (data && 'data' in data) {
    data = data.data;
    params = data;
  }
  if (!_.isNonNullObject(params)) {
    params = emo;
  }

  this._payment = this._payment || new Payment(data, params, this);
  return this;
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
    callback: _Func.bind(otpCallback, payment),
  });
};

razorpayProto.resendOTP = function(callback) {
  var payment = this._payment;
  payment.ajax = fetch.post({
    url: makeAuthUrl(this, 'payments/' + payment.payment_id + '/otp_resend'),
    data: {
      '_[source]': 'checkoutjs',
    },
    callback: _Func.bind(ajaxCallback, payment),
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
        discreet.redirect({
          url: request.url,
          content: request.content,
          method: request.method || 'post',
        });
      } else {
        ajaxCallback.call(payment, response);
      }
    },
  });
};

Razorpay.setFormatter = Formatter.FormatDelegator;

razorpayPayment.authorize = function(options) {
  var r = Razorpay({ amount: options.data.amount }).createPayment(options.data);
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
};

razorpayPayment.validate = function(data) {
  var errors = [];

  if (!isValidAmount(data.amount)) {
    errors.push({
      description: 'Invalid amount specified',
      field: 'amount',
    });
  }

  if (!data.method) {
    errors.push({
      description: 'Payment Method not specified',
      field: 'method',
    });
  }

  return err(errors);
};

razorpayPayment.getPrefs = function(data, callback) {
  return fetch({
    url: _.appendParamsToUrl(makeUrl('preferences'), data),

    // 30s
    timeout: 3e4,

    callback: function(response) {
      if (response.xhr && response.xhr.status === 0) {
        return getPrefsJsonp(data, callback);
      }
      callback(response);
    },
  });
};

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    _Doc.submitForm(data.url, data.content, data.method);
  }
};

/**
 * JSONP for fetch flows.
 *
 * @param {Object} data
 * @param {Function} callback
 */
function getFlowsJsonp(data, callback) {
  return jsonp({
    url: makeUrl('payment/flows'),
    data: data,
    timeout: 30000,
    success: function(response) {
      invoke(callback, null, response);
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
 * Gets the flows associated with a card.
 * @param {string} cardNumber
 * @param {Function} callback
 */
razorpayProto.getCardFlows = function(cardNumber = '', callback = _Func.noop) {
  // Sanitize
  cardNumber = cardNumber.replace(/\D/g, '');

  if (cardNumber.length < 6) {
    invoke(callback, null, []);
    return;
  }

  var iin = cardNumber.slice(0, 6);

  // Check cache.
  if (typeof flowCache.card[iin] !== 'undefined') {
    invoke(callback, null, flowCache.card[iin]);
    return;
  }

  getFlowsJsonp(
    {
      iin: iin,
      key_id: this.get('key'),
      '_[source]': Track.props.library || 'razorpayjs',
    },
    function(flows) {
      // Add to cache.
      flowCache.card[iin] = flows;

      // Invoke callback.
      invoke(callback, this, flowCache.card[iin]);
    }
  );
};
