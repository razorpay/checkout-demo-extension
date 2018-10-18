import getFingerprint from 'fingerprint';
import { flattenProp } from 'common/options';
import Track from 'tracker';

/* cotains mapping of sdk keys to shield key names */
const sdkToShieldMap = {
  'network.cellular_network_type': 'cellular_network_type',
  'network.connectivity_type': 'data_network_type',
  locale: 'locale',
  'os.name': 'os',
};

let shieldParams = {};

export const setShieldParams = params => {
  params = _Obj.clone(params);

  /* flatten SDK object, single level */
  params
    |> _Obj.loop((value, key) => {
      if (typeof value === 'object') {
        flattenProp(params, key, '.');
      }
    });

  params
    |> _Obj.loop((value, key) => {
      let newKey = sdkToShieldMap[key];
      if (newKey) {
        shieldParams[newKey] = value;
      }
    });
};

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
          // send boolean value true as 1
          // 0 wouldn't react this line
          if (_.isBoolean(val)) {
            val = 1;
          }
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

  if (payment.tez) {
    if (!payment.r.tezPossible) {
      return payment.r.emit(
        'payment.error',
        _.rzpError('Tez is not available')
      );
    }
    data['_[flow]'] = 'intent';
  }

  let fingerprint = getFingerprint();
  if (fingerprint) {
    data['_[shield][fhash]'] = fingerprint;
  }

  data['_[shield][tz]'] = -new Date().getTimezoneOffset();

  shieldParams
    |> _Obj.loop((value, key) => {
      data[`_[shield][${key}]`] = value;
    });

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
