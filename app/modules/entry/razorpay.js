import 'lib/polyfill/checkout';
import Razorpay from 'common/Razorpay';
import 'payment';
import 'analytics/track-errors';

import { Track } from 'analytics';
import { returnAsIs } from 'lib/utils';
import { submitForm } from 'common/form';
import { EventsV2, ContextProperties } from 'analytics-v2';
import { COMMIT_HASH } from 'common/constants';

const library = 'razorpayjs';
Track.props.library = library;
EventsV2.setContext(ContextProperties.LIBRARY, library);
EventsV2.setContext(ContextProperties.VERSION, COMMIT_HASH);

Razorpay.payment.authorize = function (options) {
  const r = Razorpay({ amount: options.data.amount }).createPayment(
    options.data
  );
  r.on('payment.success', options.success);
  r.on('payment.error', options.error);
  return r;
};

Razorpay.payment.validate = returnAsIs;

Razorpay.sendMessage = function (message) {
  if (message && message.event === 'redirect') {
    const request = message.data;
    submitForm({
      url: request.url,
      params: request.content,
      method: request.method,
    });
  }
};

export default Razorpay;
