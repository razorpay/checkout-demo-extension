import Analytics, { Track } from 'analytics';
import Eventer from 'eventer';
import CheckoutOptions, { flatten, RazorpayDefaults } from 'common/options';
import * as AnalyticsTypes from 'analytics-types';
import { formatPayload } from 'payment/validator';
import RazorpayStore, { getOption } from 'razorpay';
import { returnAsIs } from 'lib/utils';
import fetch from 'utils/fetch';
import {
  supportedCurrencies,
  displayCurrencies,
  getCurrencyConfig,
  formatAmountWithSymbol,
} from 'common/currency';
import { getAgentPayload } from 'checkoutstore/methods';
import { checkCREDEligibility } from 'checkoutframe/cred';
import { backendEntityIds, makeUrl } from './helper';
import { isEmpty, isNonNullObject } from 'utils/object';
import { BUILD_NUMBER } from './constants';

let prefetchedPrefs;

/**
 *
 * @returns sdk_meta set by SDK s (android/iOS) which is supposed to add to prefs
 */
export function getSdkMetaForRequestPayload() {
  let sdk_meta = undefined;

  if (!global.CheckoutBridge) {
    try {
      sdk_meta = JSON.parse(
        global.__rzp_options || global.top?.__rzp_options || '{}'
      );
    } catch (error) {}
  }

  return sdk_meta;
}

export default function Razorpay(overrides) {
  if (!_.is(this, Razorpay)) {
    return new Razorpay(overrides);
  }
  Eventer.call(this);
  this.id = Track.makeUid();
  Analytics.setR(this);

  let options;
  try {
    options = base_configure(overrides);
    this.get = options.get;
    this.set = options.set;
  } catch (e) {
    let message = e.message;
    if (!this.get || !this.isLiveMode()) {
      if (isNonNullObject(overrides) && !overrides.parent) {
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

  integrationKeys.forEach((key) => {
    const value = this.get(`_.${key}`);
    if (value) {
      Track.props[key] = value;
    }
  });

  if (
    backendEntityIds.every(function (prop) {
      return !options.get(prop);
    })
  ) {
    _.throwMessage('No key passed');
  }

  // this will set rzp instance to helper for both checkout.js & rzp.js
  RazorpayStore.updateInstance(this);
  this.postInit();
}

let RazorProto = (Razorpay.prototype = new Eventer());

RazorProto.postInit = returnAsIs;

RazorProto.onNew = function (event, callback) {
  if (event === 'ready') {
    if (this.prefs) {
      callback(event, this.prefs);
    } else {
      getPrefsJsonp(makePrefParams(this), (response) => {
        if (response.methods) {
          this.prefs = response;
          this.methods = response.methods;
        }
        callback(this.prefs, response);
      });
    }
  }
};

RazorProto.emi_calculator = function (length, rate) {
  return Razorpay.emi.calculator(this.get('amount') / 100, length, rate);
};

Razorpay.emi = {
  calculator: function (principle, length, rate) {
    if (!rate) {
      return Math.ceil(principle / length);
    }
    rate /= 1200;
    let multiplier = Math.pow(1 + rate, length);
    return parseInt((principle * rate * multiplier) / (multiplier - 1), 10);
  },

  calculatePlan: function (principle, length, rate) {
    const installment = this.calculator(principle, length, rate);

    /**
     * Reusing principle so that we don't have discrepancy in recomputing total for no cost emi
     *
     * E.g. 6000 for 9 months No Cost EMI
     * Installment = 666.67
     * Total = installment*duration = 666.67*9 = 6000.03
     *
     * We want to avoid that ".03" that is shown to the user
     */
    const total = rate ? installment * length : principle;
    return { total, installment };
  },
};

function getPrefsJsonp(data, callback) {
  return fetch.jsonp({
    url: makeUrl('preferences'),
    data: data,
    callback: function (response) {
      /** for razorpay.js set preference to razorpaystore */
      RazorpayStore.preferenceResponse = response;
      callback(response);
    },
  });
}

export function setPrefetchedPrefs(prefs) {
  prefetchedPrefs = prefs;
}

export function getPrefetchedPrefs() {
  return prefetchedPrefs;
}

export function deletePrefsCache() {
  prefetchedPrefs = null;
}

Razorpay.payment = {
  getMethods: function (callback) {
    return getPrefsJsonp(
      {
        key_id: Razorpay.defaults.key,
      },
      function (response) {
        callback(response.methods || response);
      }
    );
  },

  getPrefs: function (data, callback) {
    const prefsApiTimer = _.timer();
    Analytics.track('prefs:start', {
      type: AnalyticsTypes.METRIC,
    });

    if (isNonNullObject(data)) {
      data['_[request_index]'] = Analytics.updateRequestIndex('preferences');
    }

    if (!isEmpty(prefetchedPrefs) && !isEmpty(prefetchedPrefs.order)) {
      Analytics.track('prefs:end', {
        type: AnalyticsTypes.METRIC,
        data: { time: prefsApiTimer() },
      });
      callback(prefetchedPrefs);
      return;
    }

    return fetch({
      url: _.appendParamsToUrl(makeUrl('preferences'), data),

      callback: function (response) {
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

  getRewards: function (data, callback) {
    const rewardsApiTimer = _.timer();
    Analytics.track('rewards:start', {
      type: AnalyticsTypes.METRIC,
    });

    return fetch({
      url: _.appendParamsToUrl(makeUrl('checkout/rewards'), data),

      callback: function (response) {
        Analytics.track('rewards:end', {
          type: AnalyticsTypes.METRIC,
          data: { time: rewardsApiTimer() },
        });
        callback(response);
      },
    });
  },
};

function base_configure(overrides) {
  if (!overrides || typeof overrides !== 'object') {
    _.throwMessage('Invalid options');
  }

  let options = new CheckoutOptions(overrides);
  validateOverrides(options, ['amount']);
  setNotes(options.get('notes'));
  return options;
}

export function setNotes(notes) {
  _Obj.loop(notes, function (val, key) {
    if (_.isString(val)) {
      if (val.length > 254) {
        notes[key] = val.slice(0, 254);
      }
    } else if (!(_.isNumber(val) || _.isBoolean(val))) {
      delete notes[key];
    }
  });
}

RazorProto.isLiveMode = function () {
  let preferences = this.preferences;

  return (
    (!preferences && /^rzp_l/.test(this.get('key'))) ||
    (preferences && preferences.mode === 'live')
  );
};

RazorProto.getMode = function () {
  let preferences = this.preferences;
  if (!this.get('key') && !preferences) {
    return 'pending';
  }
  return (!preferences && /^rzp_l/.test(this.get('key'))) ||
    (preferences && preferences.mode === 'live')
    ? 'live'
    : 'test';
};

/**
 * Used for calculating the fees for the payment.
 * Resolves and rejects with a JSON.
 * @param {payload} Object
 *
 * @returns {Promise}
 */
RazorProto.calculateFees = function (payload) {
  return new Promise((resolve, reject) => {
    payload = formatPayload(payload, this);

    fetch.post({
      url: makeUrl('payments/calculate/fees'),
      data: payload,
      callback: function (response) {
        if (response.error) {
          return reject(response);
        }
        return resolve(response);
      },
    });
  });
};

/**
 * Used for creating and fetching the VA.
 * Resolves and rejects with a JSON.
 * @param {payload} Object
 *
 * @returns {Promise}
 */
RazorProto.fetchVirtualAccount = function ({ customer_id, order_id, notes }) {
  return new Promise((resolve, reject) => {
    if (!order_id) {
      reject('Order ID is required to fetch the account details');
      return;
    }
    let data = { customer_id, notes };
    if (!customer_id) {
      delete data.customer_id;
    }
    if (!notes) {
      delete data.notes;
    }
    const url = makeUrl(
      `orders/${order_id}/virtual_accounts?x_entity_id=${order_id}`
    );
    fetch.post({
      url,
      data,
      callback: function (response) {
        if (response.error) {
          return reject(response);
        }
        return resolve(response);
      },
    });
  });
};

/**
 * This is a helper API to check the user eligibility for CRED.
 * Since its a utility and doesn't have control over when it is being called,(contact change/ before payment API)
 * it's in hands of consumer ( merchant ) on when to call this.
 * Ideally it should be called before payment API call
 * @param {string} contact contact with country code
 * @returns {Promise} returns a promise with JSON
 */
RazorProto.checkCREDEligibility = checkCREDEligibility;

function isValidAmount(amt, min = 100) {
  if (/[^0-9]/.test(amt)) {
    return false;
  }
  amt = parseInt(amt, 10);

  return amt >= min;
}

export function makePrefParams(rzp) {
  if (rzp) {
    let params = {};
    /**
     * Set Key
     */
    let key_id = getOption('key');
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
    const currency = [getOption('currency')];
    const display_currency = getOption('display_currency');
    const display_amount = getOption('display_amount');
    // Display currency is only valid when a display amount is present
    if (display_currency && `${display_amount}`.length) {
      currency.push(display_currency);
    }

    params.currency = currency;
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
    ].forEach(function (key) {
      let value = getOption(key);
      if (value) {
        params[key] = value;
      }
    });

    // To differentiate that preferences is being hit from Checkout
    // eslint-disable-next-line no-undef
    params['_[build]'] = BUILD_NUMBER;
    params['_[checkout_id]'] = rzp.id;
    params['_[library]'] = Track.props.library;
    params['_[platform]'] = Track.props.platform;

    // adding agent details
    const agentPayload = getAgentPayload() || {};
    params = { ...params, ...agentPayload };
    return params;
  }
}

var discreet = {
  isBase64Image: function (image) {
    return /data:image\/[^;]+;base64/.test(image);
  },

  cancelMsg: 'Payment cancelled',

  error: function (message) {
    return {
      error: {
        description: message || discreet.cancelMsg,
      },
    };
  },
};

export const optionValidations = {
  notes: function (notes) {
    if (isNonNullObject(notes) && _.lengthOf(Object.keys(notes)) > 15) {
      return 'At most 15 notes are allowed';
    }
  },

  amount: function (amount, options) {
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

  currency: function (currency) {
    if (!supportedCurrencies.includes(currency)) {
      return 'The provided currency is not currently supported';
    }
  },

  display_currency: function (currency) {
    if (
      !(currency in displayCurrencies) &&
      currency !== Razorpay.defaults.display_currency
    ) {
      return 'This display currency is not supported';
    }
  },

  display_amount: function (amount) {
    // TODO: display_amount is only valid when display_currency is present. Add a check for this.
    amount = String(amount).replace(/([^0-9.])/g, '');
    if (!amount && amount !== Razorpay.defaults.display_amount) {
      return '';
    }
  },

  payout: function (payout, options) {
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

  _Obj.loop(optionValidations, function (validation, key) {
    if (skip.includes(key)) {
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

Razorpay.configure = function (overrides, extra = {}) {
  _Obj.loop(flatten(overrides, RazorpayDefaults), function (val, key) {
    let defaultValue = RazorpayDefaults[key];
    if (typeof defaultValue === typeof val) {
      RazorpayDefaults[key] = val;
    }
  });
  if (extra.library) {
    Track.props.library = extra.library;
  }
  if (extra.referer) {
    Track.props.referer = extra.referer;
  }
};

Razorpay.defaults = RazorpayDefaults;
global.Razorpay = Razorpay;
