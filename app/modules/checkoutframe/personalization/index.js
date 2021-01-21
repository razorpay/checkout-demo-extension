/* Personalization module for user's payment method preferences */

import { getCustomer } from 'checkoutframe/customer';
import Track from 'tracker';
import Analytics from 'analytics';
import { filterInstruments } from './filters';
import { hashFnv32a, set, getAllInstruments } from './utils';
import { extendInstruments } from './extend';
import { translateInstrumentToConfig } from './translation';
import { getInstrumentsForCustomer as getInstrumentsForCustomerFromApi } from './api';
import { getUPIIntentApps } from 'checkoutstore/native';
import { optimizeInstruments } from 'checkoutframe/personalization/optimisations';
import { score, keys } from 'checkoutframe/checkoutScore';

/* halflife for timestamp, 5 days in ms */
const TS_HALFLIFE = Math.log(2) / (5 * 86400000);

/* halflife for number of payments */
const COUNT_HALFLIFE = Math.log(2) / 10;

const INSTRUMENT_PROPS = {
  card: 'token',
  wallet: 'wallet',
  netbanking: 'bank',
  upi: ['_[flow]', 'vpa', 'upi_app', '_[upiqr]', 'token'],
  paypal: [],
  app: 'provider',
};

// EMI is the same as Card
INSTRUMENT_PROPS.emi = INSTRUMENT_PROPS.card;

/**
 * Returns extracted details for p13n
 * from a payment payload.
 * @param {Object} payment Payment payload
 * @param {Customer} customer Instance of customer
 * @param {Object} extra Extra details
 *
 * @returns {Object|undefined}
 */
function getExtractedDetails(payment, customer, extra = {}) {
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

  /**
   * If we are using a VPA token,
   * we want to generate the VPA from the token details
   * and store it in the instrument so that we can show the VPA in UI
   */
  if (payment.method === 'upi') {
    if (payment.token && customer) {
      let tokens = _Obj.getSafely(customer, 'tokens.items', []);
      let token = _Arr.find(tokens, token => token.token === details.token);

      if (!token) {
        return;
      }

      details.token_id = token.id;
      delete details.token;

      let vpaDetails = token.vpa;

      // Create a VPA from the token, if the VPA does not exist
      if (!details.vpa) {
        details.vpa = `${vpaDetails.username}@${vpaDetails.handle}`;
      }
    }
  }

  if (payment.upi_app) {
    let app = _Arr.find(
      getUPIIntentApps().all,
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
 * @returns {Object}
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
 * @returns {Object|undefined}
 */
export function createInstrumentFromPayment(payment, customer, extra) {
  const extracted = getExtractedDetails(payment, customer, extra);

  if (!extracted) {
    return;
  }

  return createInstrumentFromExtracted(extracted);
}

/**
 * A map of functions that help get existing tokens for extracted information
 */
const MAPPERS = {
  upi: (extracted, instruments) => {
    const vpa = extracted.vpa;

    // if not by vpa, find a match by key
    if (!vpa) {
      return MAPPERS.default(extracted, instruments);
    }

    // Find an instrument with the same VPA
    const existingInstrumentWithVpa = _Arr.find(
      instruments,
      instrument => instrument.vpa === vpa
    );

    // Add token to the existing instrument if it doesn't have a token already
    if (
      existingInstrumentWithVpa &&
      extracted.token_id &&
      !existingInstrumentWithVpa.token_id
    ) {
      existingInstrumentWithVpa.token_id = extracted.token_id;
    }

    return existingInstrumentWithVpa;
  },

  // Works to extract instruments based on a unique key
  default: (extracted, instruments) => {
    return _Arr.find(instruments, instrument => {
      let same = true;

      _Obj.loop(extracted, (val, key) => {
        if (instrument[key] !== val) {
          same = false;
        }
      });

      return same;
    });
  },
};

/**
 * Returns an instrument matching the payload.
 * If one doesn't exist, creates a new instrument.
 * @param {Array<Object>} instruments List of all instruments for the customer
 * @param {Object} payment Payment payload
 * @param {Customer} customer Instance of customer
 * @param {Object} extra Extra data
 *
 * @returns {Object|undefined} instrument
 */
function getOrCreateInstrument(instruments, payment, customer, extra) {
  const extracted = getExtractedDetails(payment, customer, extra);

  if (!extracted) {
    return;
  }

  const mapper = MAPPERS[payment.method] || MAPPERS.default;

  const existing = mapper(extracted, instruments);

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
 * @returns {Object|undefined} instrument
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

/**
 * Records success for the instrument and updates it in storage.
 * @param {Object} instrument Instrument to record success of
 * @param {Customer} customer
 */
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
  let instruments = getAllInstrumentsForCustomer(customer);

  const existing = _Arr.find(
    instruments,
    _instrument => _instrument.id === instrument.id
  );

  // Replace existing instrument with new one
  if (existing) {
    instruments = _Arr.remove(instruments, existing);
  }
  instruments.push(instrument);

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
 * @param {Object} extra
 *  @prop {Array} upiApps List of UPI apps on the device
 * @param {"storage"|"api"} source
 *
 * @returns {Promise<Object>>}
 *  @prop {boolean} identified
 *  @prop {Array<Instrument>} instruments
 */
export const getInstrumentsForCustomer = (customer, extra = {}, source) => {
  const { upiApps } = extra;

  let getInstruments = Promise.resolve([]);

  if (source === 'storage') {
    getInstruments = Promise.resolve({
      identified: true, // storage instruments are always identified based on user
      instruments: getAllInstrumentsForCustomer(customer),
    });
  } else if (source === 'api') {
    getInstruments = getInstrumentsForCustomerFromApi(customer);
  }

  return getInstruments.then(({ identified, instruments }) => {
    // Filter out the list
    instruments = filterInstruments({
      instruments,
      upiApps,
      customer,
    });

    instruments = optimizeInstruments({
      instruments,
      upiApps,
      customer,
    });

    instruments = extendInstruments({
      instruments,
      customer,
    });

    if (source === 'storage') {
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
    }

    // Sort instruments by their score
    _Arr.sort(instruments, (a, b) =>
      a.score > b.score ? -1 : ~~(a.score < b.score)
    );

    return {
      identified,
      instruments: _Arr.map(instruments, translateInstrumentToConfig),
    };
  });
};

/**
 * Appends the data from the selected instrument
 * to the payment creation payload.
 * @param {Object} payment Payment payload
 * @param {Object} instrument Instrument
 * @param {Array} customer Customer
 *
 * @returns {Boolean} added?
 */
export function addInstrumentToPaymentData(payment, instrument, customer) {
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

  // Add token to saved card and saved vpa instrument
  if (_Arr.contains(['card', 'upi'], payment.method)) {
    const tokens = customer && _Obj.getSafely(customer, 'tokens.items', []);

    const token = _Arr.find(tokens, token => token.id === instrument.token_id);

    if (token) {
      payment.token = token.token;
      added = true;
    }
  }

  if (payment.method === 'upi' && payment.token) {
    delete payment.vpa;
  }

  return added;
}

/**
 * Does this device have any instruments at all?
 *
 * @returns {boolean}
 */
export function hasAnyInstrumentsOnDevice() {
  try {
    return _Obj.keys(getAllInstruments()).length > 0;
  } catch (err) {}

  return false;
}

/**
 * Tracks the number of p13n contacts present in storage.
 */
export function trackNumberOfP13nContacts() {
  Analytics.setMeta('p13nUsers', _Obj.keys(getAllInstruments()).length);
}
