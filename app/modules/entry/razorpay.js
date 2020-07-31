import Razorpay from 'common/Razorpay';
import 'payment';
import Analytics from 'analytics';
import Track from 'tracker';

Track.props.library = 'razorpayjs';

Razorpay.payment.authorize = function(options) {
  var r = Razorpay({ amount: options.data.amount }).createPayment(options.data);
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
};

Razorpay.payment.validate = _Func.noop;

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    _Doc.submitForm(data.url, data.content, data.method);
  }
};

window.addEventListener('rzp_error', function(event) {
  var error = event.detail;

  Analytics.track('cfu_error', {
    data: {
      error: error,
    },
    immediately: true,
  });
});

window.addEventListener('rzp_network_error', function(event) {
  var detail = event.detail;

  Analytics.track('network_error', {
    data: detail,
    immediately: true,
  });
});

export default Razorpay;
