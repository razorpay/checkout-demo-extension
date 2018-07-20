razorpayPayment.authorize = function(options) {
  var r = Razorpay({ amount: options.data.amount }).createPayment(options.data);
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
};

razorpayPayment.validate = _Func.noop;

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    _Doc.submitForm(data.url, data.content, data.method);
  }
};

export default Razorpay;
