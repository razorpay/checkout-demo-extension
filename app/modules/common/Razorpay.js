import Analytics from 'analytics';
import Eventer from 'eventer';
import Track from 'tracker';
import CheckoutOptions, { flatten, RazorpayDefaults } from 'common/options';
import * as AnalyticsTypes from 'analytics-types';
import { formatPayload } from 'payment/validator';
import RazorpayConfig from 'common/RazorpayConfig';

import {
  supportedCurrencies,
  displayCurrencies,
  getCurrencyConfig,
  formatAmountWithSymbol,
} from 'common/currency';

export function makeUrl(path = '') {
  return RazorpayConfig.api + RazorpayConfig.version + path;
}

const backendEntityIds = [
  'key',
  'order_id',
  'invoice_id',
  'subscription_id',
  'auth_link_id',
  'payment_link_id',
  'contact_id',
  'checkout_config_id',
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

  // Add integration details if present
  const integrationKeys = [
    'integration',
    'integration_version',
    'integration_parent_version',
  ];

  _Arr.loop(integrationKeys, key => {
    const value = this.get(`_.${key}`);
    if (value) {
      Track.props[key] = value;
    }
  });

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
    const prefsApiTimer = _.timer();
    Analytics.track('prefs:start', {
      type: AnalyticsTypes.METRIC,
    });

    if (_.isNonNullObject(data)) {
      data['_[request_index]'] = Analytics.updateRequestIndex('preferences');
    }

    return fetch({
      url: _.appendParamsToUrl(makeUrl('preferences'), data),

      callback: function(response) {
        Analytics.track('prefs:end', {
          type: AnalyticsTypes.METRIC,
          data: { time: prefsApiTimer() },
        });
        if (response.xhr && response.xhr.status === 0) {
          return getPrefsJsonp(data, callback);
        }
        callback(response);
      },
    });
  },

  getRewards: function(data, callback) {
    const rewardsApiTimer = _.timer();
    Analytics.track('rewards:start', {
      type: AnalyticsTypes.METRIC,
    });

    if (_.isNonNullObject(data)) {
      data['_[request_index]'] = Analytics.updateRequestIndex('rewards');
    }

    return fetch({
      url: _.appendParamsToUrl(makeUrl('rewards'), data),

      callback: function(response) {
        Analytics.track('rewards:end', {
          type: AnalyticsTypes.METRIC,
          data: { time: rewardsApiTimer() },
        });
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
  validateOverrides(options, ['amount']);
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

/**
 * Used for calculating the fees for the payment.
 * Resolves and rejects with a JSON.
 * @param {payload} Object
 *
 * @returns {Promise}
 */
RazorProto.calculateFees = function(payload) {
  return new Promise((resolve, reject) => {
    payload = formatPayload(payload, this);

    fetch.post({
      url: makeUrl('payments/calculate/fees'),
      data: payload,
      callback: function(response) {
        if (response.error) {
          return reject(response);
        } else {
          return resolve(response);
        }
      },
    });
  });
};

function isValidAmount(amt, min = 100) {
  if (/[^0-9]/.test(amt)) {
    return false;
  }
  amt = parseInt(amt, 10);

  return amt >= min;
}

export function makePrefParams(rzp) {
  if (rzp) {
    var getter = rzp.get;
    var params = {};

    /**
     * Set Key
     */
    var key_id = getter('key');
    if (key_id) {
      params.key_id = key_id;
    }

    /**
     * Set the list of currencies.
     *
     * The first currency in the list should always
     * be the currency for the payment.
     * Any currency codes for which we need the
     * config can start from index 1.
     * This is needed because API will filter the
     * gateways and send the available methods
     * based on the payment currency, which it
     * expects to always be at index 0.
     */
    const currency = [getter('currency')];

    const display_currency = getter('display_currency');
    const display_amount = getter('display_amount');

    // Display currency is only valid when a display amount is present
    if (display_currency && `${display_amount}`.length) {
      currency.push(display_currency);
    }

    params.currency = currency;

    _Arr.loop(
      [
        'order_id',
        'customer_id',
        'invoice_id',
        'payment_link_id',
        'subscription_id',
        'auth_link_id',
        'recurring',
        'subscription_card_change',
        'account_id',
        'contact_id',
        'checkout_config_id',
        'amount',
      ],
      function(key) {
        var value = getter(key);
        if (value) {
          params[key] = value;
        }
      }
    );

    // To differentiate that preferences is being hit from Checkout
    // eslint-disable-next-line no-undef
    params['_[build]'] = __BUILD_NUMBER__ || 0;
    params['_[checkout_id]'] = rzp.id;
    params['_[library]'] = Track.props.library;
    params['_[platform]'] = Track.props.platform;

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
    const currency = options.display_currency || options.currency || 'INR';
    const config = getCurrencyConfig(currency);
    const minimum = config.minimum;

    /**
     * If decimals > 0, use minor units (eg. paise for INR)
     * If decimals = 0, use major units (eg. rupee for INR)
     */
    let units = '';
    if (config.decimals && config.minor) {
      units = ` ${config.minor}`;
    } else if (config.major) {
      units = ` ${config.major}`;
    }

    if (!isValidAmount(amount, minimum) && !options.recurring) {
      return `should be passed in integer${units}. Minimum value is ${minimum}${units}, i.e. ${formatAmountWithSymbol(
        minimum,
        currency
      )}`;
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
    // TODO: display_amount is only valid when display_currency is present. Add a check for this.
    amount = String(amount).replace(/([^0-9.])/g, '');
    if (!amount && amount !== Razorpay.defaults.display_amount) {
      return '';
    }
  },

  payout: function(payout, options) {
    if (payout) {
      if (!options.key) {
        return 'key is required for a Payout';
      }

      if (!options.contact_id) {
        return 'contact_id is required for a Payout';
      }
    }
  },
};

export function validateOverrides(options, skip = []) {
  let valid = true;

  options = options.get();

  _Obj.loop(optionValidations, function(validation, key) {
    if (_Arr.contains(skip, key)) {
      return;
    }

    if (key in options) {
      let errorMessage = validation(options[key], options);
      if (errorMessage) {
        valid = false;
        _.throwMessage('Invalid ' + key + ' (' + errorMessage + ')');
      }
    }
  });

  return valid;
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
