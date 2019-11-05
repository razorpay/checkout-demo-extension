/* Personalization module for user's payment method preferences */

import { getCustomer } from 'checkoutframe/customer';
import Track from 'tracker';
import Analytics from 'analytics';
import { filterInstruments } from './filters';
import { hashFnv32a, set, getAllInstruments } from './utils';

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
 * Returns extracted details for p13n
 * from a payment payload.
 * @param {Object} payment Payment payload
 * @param {Customer} customer Instance of customer
 * @param {Object} extra Extra details
 *
 * @returns {Object}
 */
function getExtractedDetails(payment, customer, extra = {}) {
  const { upi_intents_data = [] } = extra;

  const details = {};

  let extractable = INSTRUMENT_PROPS[payment.method];

  if (!extractable) {
    return;
  }

  if (!_.isArray(extractable)) {
    extractable = [extractable];
  }

  extractable.push('method');

  _Arr.loop(extractable, item => {
    if (typeof payment[item] !== 'undefined') {
      details[item] = payment[item];
    }
  });

  /**
   * Set bank code for saved card. This will be used to prompt user to login if
   * user logs out in future.
   *
   * Unset card object if payment not made via saved card
   */
  if (_Arr.contains(['card', 'emi'], payment.method)) {
    details.method = 'card';
    if (payment.token) {
      if (customer) {
        let cards = (customer.tokens || {}).items || [];
        let token = _Arr.find(cards, card => card.token === details.token);

        if (!token) {
          return;
        }

        let cardDetails = token.card;

        details.token_id = token.id;
        delete details.token;

        _Arr.loop(['type', 'issuer', 'network'], key => {
          if (cardDetails[key]) {
            details[key] = cardDetails[key];
          }
        });
      }
    } else {
      return;
    }
  }

  if (payment.upi_app) {
    let app = _Arr.find(
      upi_intents_data,
      app => app.package_name === payment.upi_app
    );
    details.app_name = app.app_name;
    details.app_icon = app.app_icon;
  }

  return details;
}

/**
 * Creates an instrument from the extracted payload
 * @param {Object} extracted Extracted details from payment payload
 *
 * @retuns {Objects}
 */
function createInstrumentFromExtracted(extracted) {
  // Extend with defaults and return
  return _Obj.extend(
    {
      frequency: 0,
      id: Track.makeUid(),
      success: false,
      timestamp: _.now(),
    },
    extracted
  );
}

/**
 * Creates an instrument from the payment.
 * @param {Object} payment Payment payload
 * @param {Customer} customer Instance of customer
 * @param {Object} extra Extra details
 *
 * @returns {Object}
 */
export function createInstrumentFromPayment(payment, customer, extra) {
  const extracted = getExtractedDetails(payment, customer, extra);

  if (!extracted) {
    return;
  }

  return createInstrumentFromExtracted(extracted);
}

/**
 * Returns an instrument matching the payload.
 * If one doesn't exist, creates a new instrument.
 * @param {Array<Object>} instruments List of all instruments for the customer
 * @param {Object} payment Payment payload
 * @param {Customer} customer Instance of customer
 * @param {Object} extra Extra data
 *
 * @returns {Object} instrument
 */
function getOrCreateInstrument(instruments, payment, customer, extra) {
  const extracted = getExtractedDetails(payment, customer, extra);

  if (!extracted) {
    return;
  }

  const existing = _Arr.find(instruments, item => {
    let same = true;

    _Obj.loop(extracted, (val, key) => {
      if (item[key] !== val) {
        same = false;
      }
    });

    return same;
  });

  if (existing) {
    return existing;
  }

  return createInstrumentFromExtracted(extracted);
}

/**
 * Used to add the instrument to the list of user's instruments
 * along with other metadata.
 * @param {Object} payment Payment payload
 * @param {Object} extra Extra data
 *
 * @returns {Object} instrument
 */
export function processInstrument(payment, extra) {
  const customer = getCustomer(payment.contact);
  const instrumentsList = getAllInstrumentsForCustomer(customer);
  const instrument = getOrCreateInstrument(
    instrumentsList,
    payment,
    customer,
    extra
  );

  if (!instrument) {
    return;
  }

  instrument.timestamp = _.now();
  instrument.frequency++;

  updateInstrumentForCustomer(instrument, customer);

  return instrument;
}

/* record success for the current payment method */
export const recordSuccess = (instrument, customer) => {
  if (!instrument || !customer) {
    return;
  }

  instrument.success = true;

  Analytics.track('p13n:instrument:success', {
    data: {
      instrument,
    },
  });

  updateInstrumentForCustomer(instrument, customer);
};

/**
 * Updates the list of instruments in storage for the given customer.
 * @param {Array<Object>} instruments List of instruments for the contact
 * @param {Object} customer
 *
 * @returns {Array<Object>} instruments
 */
function updateInstrumentForCustomer(instrument, customer) {
  const { contact } = customer;

  // Get instruments for all customers
  const instrumentsList = getAllInstruments();
  const instruments = getAllInstrumentsForCustomer(customer);

  const existing = _Arr.find(
    instruments,
    _instrument => _instrument.id === instrument.id
  );

  if (!existing) {
    instruments.push(instrument);
  }

  instrumentsList[hashFnv32a(contact)] = instruments;

  set(instrumentsList);

  return instruments;
}

/**
 * Returns a list of all instruments for the customer.
 * @param {Object} customer
 *
 * @return {Array<Object>}
 */
export function getAllInstrumentsForCustomer(customer) {
  const { contact } = customer;

  // Get instruments for all customers
  const instrumentsList = getAllInstruments();

  // Get instrument for contact
  const instruments = instrumentsList[hashFnv32a(contact)] || [];

  return instruments;
}

/**
 * Returns the list of preferred payment modes for the user in a sorted order
 * @param {Object} customer
 *
 * @returns {Array<Object>}
 */
export const getInstrumentsForCustomer = customer => {
  let instruments = getAllInstrumentsForCustomer(customer);

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
 * Appends the data from the selected instrument
 * to the payment creation payload.
 * @param {Object} payment Payment payload
 * @param {Object} instrument Instrument
 *
 * @returns {Boolean} added?
 */
export function addInstrumentToPaymentData(payment, instrument) {
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
      payment[prop] = instrument[prop];
      added = true;
    }
  });

  return added;
}
