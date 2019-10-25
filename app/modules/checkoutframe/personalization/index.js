/* Personalization module for user's payment method preferences */

import { getCustomer } from 'checkoutframe/customer';
import Track from 'tracker';
import Analytics from 'analytics';
import { filterInstruments } from './filters';
import { hashFnv32a, set, get } from './utils';

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
  paypal: [],
};

let currentUid = null;

/**
 * Creates an instrument.
 * Only used to create PayPal instrument at runtime.
 * Not ready yet to be used everywhere.
 */
export function _createInstrumentForImmediateUse(data, extraData) {
  let methodData = {
    frequency: 1,
    id: Track.makeUid(),
    success: false,
    timestamp: _.now(),
  };
  let extractable = INSTRUMENT_PROPS[data.method];

  if (!extractable) {
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

  if (data.upi_app) {
    let app = _Arr.find(
      extraData.upi_intents_data,
      app => app.package_name === data.upi_app
    );
    methodData.app_name = app.app_name;
    methodData.app_icon = app.app_icon;
  }

  return methodData;
}

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
export const getInstruments = customer => {
  // Get instruments for all customers
  let instrumentList = _Obj.parse(get(PREFERRED_INSTRUMENTS));

  if (!instrumentList) {
    return;
  }
  // Get instrument for current customer
  let instruments = instrumentList[hashFnv32a(customer.contact)];

  if (!instruments) {
    return;
  }

  // Filter out the list
  instruments = filterInstruments({
    instruments,
  });

  // Add score for each instrument
  _Arr.loop(instruments, instrument => {
    let timeSincePayment = _.now() - instrument.timestamp;
    let tsScore = Math.exp(-TS_HALFLIFE * timeSincePayment);
    let countScore = 1 - Math.exp(-COUNT_HALFLIFE * instrument.frequency);
    let C = ~~instrument.success * 2 - 1;

    /*
     * Simplified form for:
     * - if success is true
     *   score = 0.7 * tsScore + 0.3 * countScore
     * - else
     *   score = 0.3 * tsScore + 0.7 * countScore
     */

    instrument.score =
      (tsScore + countScore) / 2.0 + 0.2 * C * (tsScore - countScore);
  });

  // Sort instruments by their score
  _Arr.sort(instruments, (a, b) =>
    a.score > b.score ? -1 : ~~(a.score < b.score)
  );

  return instruments;
};

/**
 * Appends the data from the selected instrument to the payment creation
 * payload.
 * @param {Object} paymentData
 * @param {Object} instrument
 *
 * @returns {Boolean} added?
 */
export function addInstrumentToPaymentData(paymentData, instrument) {
  let added = false;

  // Sanity check
  if (!instrument) {
    return added;
  }

  let propsToExtract = INSTRUMENT_PROPS[instrument.method];

  // No props present that can be extracted
  if (!propsToExtract) {
    return added;
  }

  propsToExtract = ['method'].concat(propsToExtract);

  _Arr.loop(propsToExtract, prop => {
    if (!_.isUndefined(instrument[prop])) {
      paymentData[prop] = instrument[prop];
      added = true;
    }
  });

  return added;
}
