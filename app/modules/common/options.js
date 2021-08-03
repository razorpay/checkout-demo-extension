import { shouldRedirect } from 'common/useragent';

export const RazorpayDefaults = {
  key: '',
  account_id: '',
  image: '',
  amount: 100,
  currency: 'INR',
  order_id: '',
  invoice_id: '',
  subscription_id: '',
  auth_link_id: '',
  payment_link_id: '',
  notes: null,
  callback_url: '',
  redirect: false,
  description: '',
  customer_id: '',
  recurring: null,
  payout: null,
  contact_id: '',
  signature: '',
  retry: true,
  target: '',
  subscription_card_change: null,
  display_currency: '',
  display_amount: '', // This is in majors. Eg: display_currency = USD and display_amount = 50 => $50.
  recurring_token: {
    max_amount: 0,
    expire_by: 0,
  },
  checkout_config_id: '',
  send_sms_hash: false,
};

function base_set(flatObj, defObj, objKey, objVal) {
  objKey = objKey.toLowerCase();
  var defaultVal = defObj[objKey];
  var defaultType = typeof defaultVal;

  if (defaultType === 'object' && defaultVal === null) {
    if (_.isString(objVal)) {
      if (objVal === 'true' || objVal === '1') {
        objVal = true;
      } else if (objVal === 'false' || objVal === '0') {
        objVal = false;
      }
    }
  } else if (
    defaultType === 'string' &&
    (_.isNumber(objVal) || _.isBoolean(objVal))
  ) {
    objVal = String(objVal);
  } else if (defaultType === 'number') {
    objVal = Number(objVal);
  } else if (defaultType === 'boolean') {
    if (_.isString(objVal)) {
      if (objVal === 'true' || objVal === '1') {
        objVal = true;
      } else if (objVal === 'false' || objVal === '0') {
        objVal = false;
      }
    } else if (_.isNumber(objVal)) {
      objVal = !!objVal;
    }
  }
  if (defaultVal === null || defaultType === typeof objVal) {
    flatObj[objKey] = objVal;
  }
}

export function flattenProp(obj, prop, type) {
  _Obj.loop(obj[prop], function (val, key) {
    var valType = typeof val;
    if (valType === 'string' || valType === 'number' || valType === 'boolean') {
      key = prop + type[0] + key;
      if (type.length > 1) {
        key += type[1];
      }
      obj[key] = val;
    }
  });
  delete obj[prop];
}

export function flatten(obj, defObj) {
  var flatObj = {};
  _Obj.loop(obj, function (objVal, objKey) {
    if (objKey in flatKeys) {
      _Obj.loop(objVal, function (objSubVal, objSubKey) {
        base_set(flatObj, defObj, objKey + '.' + objSubKey, objSubVal);
      });
    } else {
      base_set(flatObj, defObj, objKey, objVal);
    }
  });
  return flatObj;
}

const flatKeys = {};
export default function Options(options) {
  _Obj.loop(RazorpayDefaults, function (val, key) {
    if (_.isNonNullObject(val) && !_.isEmptyObject(val)) {
      flatKeys[key] = true;
      _Obj.loop(val, function (subVal, subKey) {
        RazorpayDefaults[key + '.' + subKey] = subVal;
      });
      delete RazorpayDefaults[key];
    }
  });
  options = flatten(options, RazorpayDefaults);
  var callback_url = options.callback_url;
  if (callback_url && shouldRedirect) {
    options.redirect = true;
  }
  this.get = function (key) {
    if (!arguments.length) {
      return options;
    }
    return key in options ? options[key] : RazorpayDefaults[key];
  };

  this.set = function (key, val) {
    options[key] = val;
  };

  this.unset = function (key) {
    delete options[key];
  };
}
