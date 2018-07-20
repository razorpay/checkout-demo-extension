import getFingerprint from 'fingerprint';
import { flattenProp } from 'common/options';

export const formatPayment = function(payment) {
  var data = payment.data;

  // Set view for fees.
  if (payment.fees) {
    data.view = 'html';
  }

  // fill data from options if empty
  var getOption = payment.r.get;
  _Arr.loop(
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
    field => {
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
  if (payment.powerwallet && data.method === 'wallet') {
    data['_[source]'] = 'checkoutjs';
  }

  let fingerprint = getFingerprint();
  if (fingerprint) {
    data['_[shield][fhash]'] = fingerprint;
  }

  data['_[shield][tz]'] = new Date().getTimezoneOffset();

  // flatten notes, card
  // notes.abc -> notes[abc]
  flattenProp(data, 'notes', '[]');
  flattenProp(data, 'card', '[]');

  var expiry = data['card[expiry]'];
  if (_.isString(expiry)) {
    data['card[expiry_month]'] = expiry.slice(0, 2);
    data['card[expiry_year]'] = expiry.slice(-2);
    delete data['card[expiry]'];
  }

  // add tracking data
  data._ = Track.common();
  // make it flat
  flattenProp(data, '_', '[]');
};
