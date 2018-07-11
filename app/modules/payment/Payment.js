import * as cookie from 'lib/cookie';
import {
  processPaymentCreate,
  processCoproto,
  processOtpResponse,
} from 'payment/coproto';
import Track from 'tracker';

import { formatPayment } from 'payment/validator';

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

  generate: function(data) {
    this.data = clone(data || this.data);
    formatPayment(this);

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
      return invoke(processOtpResponse, this, data);
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
          if (processCoproto.call(this, data)) {
            return;
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
      _Doc.submitForm(makeRedirectUrl(payment.fees), data, 'post', popup.name);
    }
  },

  makePopup: function() {
    var popup = new Popup('', 'popup_' + Track.id);
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
