import { getFingerprint, getDeviceId } from 'fingerprint';
import { flattenProp } from 'common/options';
import { Track } from 'analytics';
import { GOOGLE_PAY_PACKAGE_NAME } from 'upi/constants';
import { luhnCheck } from 'lib/utils';
import { getOption, getOrderId } from 'razorpay';
import * as ObjectUtils from 'utils/object';
import { BUILD_NUMBER } from 'common/constants';
import * as _ from 'utils/_';
export const formatPayment = function (payment) {
  let params = ['feesRedirect', 'tez', 'gpay', 'avoidPopup'].reduce(
    (allParams, param) => {
      if (payment.hasOwnProperty(param)) {
        allParams[param] = payment[param];
      }
      return allParams;
    },
    {}
  );

  payment.data = formatPayload(payment.data, params);
  validateData(payment.data);
};

export function validateData(data) {
  const cardHolderName = data?.['card[name]'];
  if (Number(cardHolderName) === 0) {
    return;
  } // if name input is only zero prevent throw error
  if (cardHolderName && luhnCheck(cardHolderName)) {
    _.throwMessage(
      'Error in integration. Card holder name is not valid, Please contact Razorpay for assistance'
    );
  }
}

export const formatPayload = function (payload, params = {}) {
  let data = ObjectUtils.clone(payload);

  // won't affect origin payload. as it is cloned
  if (data.default_dcc_currency) {
    delete data.default_dcc_currency;
  }

  // Set view for fees.
  if (params.feesRedirect) {
    data.view = 'html';
  }
  // fill data from options if empty

  [
    'amount',
    'currency',
    'signature',
    'description',
    'order_id',
    'account_id',
    'notes',
    'subscription_id',
    'auth_link_id',
    'payment_link_id',
    'customer_id',
    'recurring',
    'subscription_card_change',
    'recurring_token.max_amount',
    'recurring_token.expire_by',
  ].forEach((field) => {
    if (!data.hasOwnProperty(field)) {
      let val = field === 'order_id' ? getOrderId() : getOption(field);
      if (val) {
        // send boolean value true as 1
        // 0 wouldn't react this line
        if (typeof val === 'boolean') {
          val = 1;
        }
        data[field.replace(/\.(\w+)/g, '[$1]')] = val;
      }
    }
  });

  let key_id = getOption('key');
  if (!data.key_id && key_id) {
    data.key_id = key_id;
  }

  // api needs this flag to decide between redirect/otp
  if (params.avoidPopup && data.method === 'wallet') {
    data['_[source]'] = 'checkoutjs';
  }

  if (params.tez || params.gpay) {
    data['_[flow]'] = 'intent';
    if (!data['_[app]']) {
      data['_[app]'] = GOOGLE_PAY_PACKAGE_NAME;
    }
  }

  // Add integration details if present
  const integrationKeys = [
    'integration',
    'integration_version',
    'integration_parent_version',
  ];
  integrationKeys.forEach((key) => {
    const value = getOption(`_.${key}`);
    if (value) {
      data[`_[${key}]`] = value;
    }
  });

  let fingerprint = getFingerprint();
  if (fingerprint) {
    data['_[shield][fhash]'] = fingerprint;
  }

  let deviceId = getDeviceId();
  if (deviceId) {
    data['_[device_id]'] = deviceId;
  }

  data['_[shield][tz]'] = -new Date().getTimezoneOffset();

  // eslint-disable-next-line no-undef
  data['_[build]'] = BUILD_NUMBER;

  // flatten notes, card
  // notes.abc -> notes[abc]
  flattenProp(data, 'notes', '[]');
  flattenProp(data, 'card', '[]');

  let expiry = data['card[expiry]'];
  if (_.isString(expiry)) {
    data['card[expiry_month]'] = expiry.slice(0, 2);
    data['card[expiry_year]'] = expiry.slice(-2);
    delete data['card[expiry]'];
  }

  // add tracking data
  data._ = Track.common();
  // make it flat
  flattenProp(data, '_', '[]');

  return data;
};
