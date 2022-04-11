import Razorpay from 'common/Razorpay';
import 'payment';
import 'analytics/track-errors';

import { Track } from 'analytics';
import { returnAsIs } from 'lib/utils';
import { submitForm } from 'utils/doc';

Track.props.library = 'razorpayjs';

Razorpay.payment.authorize = function (options) {
  var r = Razorpay({ amount: options.data.amount }).createPayment(options.data);
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
};

Razorpay.payment.validate = returnAsIs;

Razorpay.sendMessage = function (message) {
  if (message && message.event === 'redirect') {
    var data = message.data;
    submitForm(data.url, data.content, data.method);
  }
};

export default Razorpay;
