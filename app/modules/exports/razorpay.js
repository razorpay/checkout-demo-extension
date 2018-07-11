import Payment from 'payment/Payment';
import { processCoproto, processOtpResponse } from 'payment/coproto';
import { FormatDelegator } from './formatter';

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
        discreet.redirect({
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

Razorpay.setFormatter = FormatDelegator;

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

export default Razorpay;
