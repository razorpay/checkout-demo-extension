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
  payment_link_id: '',
  notes: null,
  callback_url: '',
  redirect: false,
  description: '',
  customer_id: '',
  recurring: null,
  signature: '',
  retry: true,
  target: '',
  subscription_card_change: null,
  display_currency: '',
  display_amount: '',
  recurring_token: {
    max_amount: 0,
    expire_by: 0,
  },
};

function base_set(flatObj, defObj, objKey, objVal) {
  objKey = objKey.toLowerCase();
  var defaultVal = defObj[objKey];
  var defaultType = typeof defaultVal;
  if (defaultType === 'string' && (_.isNumber(objVal) || _.isBoolean(objVal))) {
    objVal = String(objVal);
  } else if (defaultType === 'number') {
    objVal = Number(objVal);
  } else if (defaultType === 'boolean' && _.isString(objVal)) {
    if (objVal === 'true') {
      objVal = true;
    } else if (objVal === 'false') {
      objVal = false;
    }
  }
  if (defaultVal === null || defaultType === typeof objVal) {
    flatObj[objKey] = objVal;
  }
}

export function flattenProp(obj, prop, type) {
  _Obj.loop(obj[prop], function(val, key) {
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
  _Obj.loop(obj, function(objVal, objKey) {
    if (objKey in flatKeys) {
      _Obj.loop(objVal, function(objSubVal, objSubKey) {
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
  _Obj.loop(RazorpayDefaults, function(val, key) {
    if (_.isNonNullObject(val)) {
      flatKeys[key] = true;
      _Obj.loop(val, function(subVal, subKey) {
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
  this.get = function(key) {
    if (!arguments.length) {
      return options;
    }
    return key in options ? options[key] : RazorpayDefaults[key];
  };

  this.set = function(key, val) {
    options[key] = val;
  };

  this.unset = function(key) {
    delete options[key];
  };
}
