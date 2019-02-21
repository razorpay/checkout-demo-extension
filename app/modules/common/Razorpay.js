import Analytics from 'analytics';
import Eventer from 'eventer';
import Track from 'tracker';
import CheckoutOptions, { flatten, RazorpayDefaults } from 'common/options';
import { supportedCurrencies, displayCurrencies } from 'common/currency';

export const RazorpayConfig = {
  api: 'https://api.razorpay.com/',
  version: 'v1/',
  frameApi: '/',
  cdn: 'https://cdn.razorpay.com/',
};

try {
  _Obj.extend(RazorpayConfig, global.Razorpay.config);
} catch (e) {}

export function makeUrl(path = '') {
  return RazorpayConfig.api + RazorpayConfig.version + path;
}

const backendEntityIds = [
  'key',
  'order_id',
  'invoice_id',
  'subscription_id',
  'payment_link_id',
];

export function makeAuthUrl(r, url) {
  url = makeUrl(url);

  for (var i = 0; i < backendEntityIds.length; i++) {
    var prop = backendEntityIds[i];
    var value = r.get(prop);
    if (prop === 'key') {
      prop = 'key_id';
    } else {
      prop = 'x_entity_id';
    }
    if (value) {
      var account_id = r.get('account_id');
      if (account_id) {
        value += '&account_id=' + account_id;
      }
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + prop + '=' + value;
    }
  }
  return url;
}

export default function Razorpay(overrides) {
  if (!_.is(this, Razorpay)) {
    return new Razorpay(overrides);
  }
  Eventer.call(this);
  this.id = Track.makeUid();
  Analytics.setR(this);

  var options;
  try {
    options = base_configure(overrides);
    this.get = options.get;
    this.set = options.set;
  } catch (e) {
    var message = e.message;
    if (!this.get || !this.isLiveMode()) {
      if (_.isNonNullObject(overrides) && !overrides.parent) {
        global.alert(message);
      }
    }
    _.throwMessage(message);
  }

  if (
    backendEntityIds.every(function(prop) {
      return !options.get(prop);
    })
  ) {
    _.throwMessage('No key passed');
  }

  this.postInit();
}

var RazorProto = (Razorpay.prototype = new Eventer());

RazorProto.postInit = _Func.noop;

RazorProto.onNew = function(event, callback) {
  if (event === 'ready') {
    if (this.prefs) {
      callback(event, this.prefs);
    } else {
      getPrefsJsonp(makePrefParams(this), response => {
        if (response.methods) {
          this.prefs = response;
          this.methods = response.methods;
        }
        callback(this.prefs, response);
      });
    }
  }
};

RazorProto.emi_calculator = function(length, rate) {
  return Razorpay.emi.calculator(this.get('amount') / 100, length, rate);
};

Razorpay.emi = {
  calculator: function(principle, length, rate) {
    if (!rate) {
      return Math.ceil(principle / length);
    }
    rate /= 1200;
    var multiplier = Math.pow(1 + rate, length);
    return parseInt((principle * rate * multiplier) / (multiplier - 1), 10);
  },
};

function getPrefsJsonp(data, callback) {
  return fetch.jsonp({
    url: makeUrl('preferences'),
    data: data,
    callback: callback,
  });
}

var razorpayPayment = (Razorpay.payment = {
  getMethods: function(callback) {
    return getPrefsJsonp(
      {
        key_id: Razorpay.defaults.key,
      },
      function(response) {
        callback(response.methods || response);
      }
    );
  },

  getPrefs: function(data, callback) {
    return fetch({
      url: _.appendParamsToUrl(makeUrl('preferences'), data),

      callback: function(response) {
        if (response.xhr && response.xhr.status === 0) {
          return getPrefsJsonp(data, callback);
        }
        callback(response);
      },
    });
  },
});

function base_configure(overrides) {
  if (!overrides || typeof overrides !== 'object') {
    _.throwMessage('Invalid options');
  }

  var options = new CheckoutOptions(overrides);
  validateOverrides(options);
  setNotes(options);
  return options;
}

function setNotes(options) {
  var notes = options.get('notes');
  _Obj.loop(notes, function(val, key) {
    if (_.isString(val)) {
      if (val.length > 254) {
        notes[key] = val.slice(0, 254);
      }
    } else if (!(_.isNumber(val) || _.isBoolean(val))) {
      delete notes[key];
    }
  });
}

RazorProto.isLiveMode = function() {
  var preferences = this.preferences;

  return (
    (!preferences && /^rzp_l/.test(this.get('key'))) ||
    (preferences && preferences.mode === 'live')
  );
};

function isValidAmount(amt) {
  if (/[^0-9]/.test(amt)) {
    return false;
  }
  amt = parseInt(amt, 10);

  return amt >= 100;
}

export function makePrefParams(rzp) {
  if (rzp) {
    var getter = rzp.get;
    var params = {};
    var key_id = getter('key');
    if (key_id) {
      params.key_id = key_id;
    }

    _Arr.loop(
      [
        'order_id',
        'customer_id',
        'invoice_id',
        'payment_link_id',
        'subscription_id',
        'recurring',
        'subscription_card_change',
        'account_id',
      ],
      function(key) {
        var value = getter(key);
        if (value) {
          params[key] = value;
        }
      }
    );

    return params;
  }
}

var discreet = {
  isBase64Image: function(image) {
    return /data:image\/[^;]+;base64/.test(image);
  },

  cancelMsg: 'Payment cancelled',

  error: function(message) {
    return {
      error: {
        description: message || discreet.cancelMsg,
      },
    };
  },
};

export const optionValidations = {
  notes: function(notes) {
    if (_.isNonNullObject(notes) && _.lengthOf(_Obj.keys(notes)) > 15) {
      return 'At most 15 notes are allowed';
    }
  },

  amount: function(amount, options) {
    if (!isValidAmount(amount) && !options.recurring) {
      return 'should be passed in integer paise. Minimum value is 100 paise, i.e. ₹ 1';
    }
  },

  currency: function(currency) {
    if (!_Arr.contains(supportedCurrencies, currency)) {
      return 'The provided currency is not currently supported';
    }
  },

  display_currency: function(currency) {
    if (
      !(currency in displayCurrencies) &&
      currency !== Razorpay.defaults.display_currency
    ) {
      return 'This display currency is not supported';
    }
  },

  display_amount: function(amount) {
    amount = String(amount).replace(/([^0-9.])/g, '');
    if (!amount && amount !== Razorpay.defaults.display_amount) {
      return '';
    }
  },
};

function validateOverrides(options) {
  options = options.get();
  _Obj.loop(optionValidations, function(validation, key) {
    if (key in options) {
      let errorMessage = validation(options[key], options);
      if (errorMessage) {
        _.throwMessage('Invalid ' + key + ' (' + errorMessage + ')');
      }
    }
  });
}

Razorpay.configure = function(overrides) {
  _Obj.loop(flatten(overrides, RazorpayDefaults), function(val, key) {
    var defaultValue = RazorpayDefaults[key];
    if (typeof defaultValue === typeof val) {
      RazorpayDefaults[key] = val;
    }
  });
};

Razorpay.defaults = RazorpayDefaults;
global.Razorpay = Razorpay;
