/* Personalization module for user's payment method preferences */

import { getCustomer } from 'checkoutframe/customer';
import { getSortedApps } from 'common/upi';
import Track from 'tracker';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

const PREFERRED_INSTRUMENTS = 'rzp_preffered_instruments';

/* halflife for timestamp, 5 days in ms */
const TS_HALFLIFE = Math.log(2) / (5 * 86400000);

/* halflife for number of payments */
const COUNT_HALFLIFE = Math.log(2) / 10;

const INSTRUMENT_PROPS = {
  card: 'token',
  wallet: 'wallet',
  netbanking: 'bank',
  upi: ['_[flow]', 'vpa', 'upi_app', '_[upiqr]'],
};

const set = (key, data) => {
  try {
    global.localStorage.setItem(key, data);
  } catch (e) {}
};

const get = key => {
  try {
    return global.localStorage.getItem(key);
  } catch (e) {}

  return '[]';
};

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */

const hashFnv32a = (str = '', asString = true, seed = 0xdeadc0de) => {
  let i,
    l,
    hval = seed;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if (asString) {
    // Convert to 8 digit hex string
    return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
};

let currentUid = null;

/**
 * Used to add the instrument to the list of user's instruments along with
 * other metadata
 * @param  {Object} data payment creation data
 */
export const processInstrument = (data, extraData) => {
  let methodData = {};
  let extractable = INSTRUMENT_PROPS[data.method];
  let instrumentList = _Obj.parse(get(PREFERRED_INSTRUMENTS)) || {};
  let customer = getCustomer(data.contact);
  let hashedContact = hashFnv32a(customer.contact);

  instrumentList[hashedContact] = instrumentList[hashedContact] || [];
  let currentCustomer = instrumentList[hashedContact];

  if (!extractable) {
    currentUid = null;
    return;
  }

  if (!_.isArray(extractable)) {
    extractable = [extractable];
  }

  extractable.push('method');

  _Arr.loop(extractable, item => {
    if (typeof data[item] !== 'undefined') {
      methodData[item] = data[item];
    }
  });

  /**
   * Set bank code for saved card. This will be used to prompt user to login if
   * user logs out in future.
   *
   * Unset card object if payment not made via saved card
   */
  if (_Arr.contains(['card', 'emi'], data.method)) {
    methodData.method = 'card';
    if (data.token) {
      if (customer) {
        let cards = (customer.tokens || {}).items || [];
        let token = _Arr.find(cards, card => card.token === methodData.token);

        if (!token) {
          return;
        }

        let cardDetails = token.card;

        methodData.token_id = token.id;
        delete methodData.token;

        _Arr.loop(['type', 'issuer', 'network'], key => {
          if (cardDetails[key]) {
            methodData[key] = cardDetails[key];
          }
        });
      }
    } else {
      methodData = {};
    }
  }

  if (data.upi_app) {
    let app = _Arr.find(
      extraData.upi_intents_data,
      app => app.package_name === data.upi_app
    );
    methodData.app_name = app.app_name;
    methodData.app_icon = app.app_icon;
  }

  let instrument = _Arr.find(currentCustomer, item => {
    let same = true;

    _Obj.loop(extractable, key => {
      if (item[key] !== methodData[key]) {
        same = false;
      }
    });

    return same;
  });

  if (instrument) {
    instrument.timestamp = _.now();
    instrument.frequency++;

    currentUid = instrument.id;
  } else if (_Obj.keys(methodData).length) {
    methodData.timestamp = _.now();
    methodData.success = false;
    methodData.frequency = 1;
    methodData.id = Track.makeUid();

    currentUid = methodData.id;
    currentCustomer.push(methodData);
  } else {
    currentUid = null;
  }

  set(PREFERRED_INSTRUMENTS, _Obj.stringify(instrumentList));
};

/* record success for the current payment method */
export const recordSuccess = customer => {
  let instrumentList = _Obj.parse(get(PREFERRED_INSTRUMENTS));
  if (!currentUid || !instrumentList) {
    return;
  }

  let currentCustomer = instrumentList[hashFnv32a(customer.contact)];
  if (!currentCustomer) {
    return;
  }

  let instrument = _Arr.find(currentCustomer, item => {
    if (item.id === currentUid) {
      return true;
    }

    return false;
  });

  if (instrument) {
    instrument.success = true;

    Analytics.track('p13n:instrument:success', {
      data: {
        instrument,
      },
    });
  }

  currentUid = null;

  set(PREFERRED_INSTRUMENTS, _Obj.stringify(instrumentList));
};

/**
 * Lists the most preffered payment modes for the user in a sorted order
 * @return {[type]} [description]
 */
export const listInstruments = customer => {
  let instrumentList = _Obj.parse(get(PREFERRED_INSTRUMENTS));
  if (!instrumentList) {
    return;
  }

  let currentCustomer = instrumentList[hashFnv32a(customer.contact)];
  if (!currentCustomer) {
    return;
  }

  _Arr.loop(currentCustomer, item => {
    let timeSincePayment = _.now() - item.timestamp;
    let tsScore = Math.exp(-TS_HALFLIFE * timeSincePayment);
    let countScore = 1 - Math.exp(-COUNT_HALFLIFE * item.frequency);
    let C = ~~item.success * 2 - 1;

    /*
     * Simplified form for:
     * - if success is true
     *   score = 0.7 * tsScore + 0.3 * countScore
     * - else
     *   score = 0.3 * tsScore + 0.7 * countScore
     */

    item.score =
      (tsScore + countScore) / 2.0 + 0.2 * C * (tsScore - countScore);
  });

  _Arr.sort(
    currentCustomer,
    (a, b) => (a.score > b.score ? -1 : ~~(a.score < b.score))
  );

  Analytics.track('p13n:instruments:list', {
    data: {
      length: currentCustomer.length,
    },
  });

  return currentCustomer;
};

/**
 * Appends the data from the selected instrument to the payment creation
 * payload.
 */
export const handleInstrument = (data, instrument) => {
  var gotSome = false;
  if (!instrument) {
    return gotSome;
  }

  let propsToExtract = INSTRUMENT_PROPS[instrument.method];

  if (!propsToExtract) {
    return gotSome;
  }

  propsToExtract = ['method'].concat(propsToExtract);

  _Arr.loop(propsToExtract, key => {
    if (typeof instrument[key] !== 'undefined') {
      data[key] = instrument[key];
      gotSome = true;
    }
  });

  return gotSome;
};
