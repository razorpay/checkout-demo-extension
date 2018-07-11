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

Razorpay.sendMessage = function(message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    _Doc.submitForm(data.url, data.content, data.method);
  }
};

export default Razorpay;
