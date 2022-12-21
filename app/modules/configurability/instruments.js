import InstrumentsConfig from './instruments-config';
import { getPackageNameFromShortcode } from 'common/upi';

/**
 * Adds a type and category to an instrument
 * @param {Instrument} instrument
 *
 * @returns {Instrument}
 */
function addTypeAndCategory(instrument) {
  instrument._type = 'instrument';

  if (isInstrumentForEntireMethod(instrument)) {
    instrument._type = 'method';
  }

  return instrument;
}

/**
 * Keys that are allowed in the instruments
 * passed created by the merchant a.k.a public API
 */
const PUBLIC_API_INSTRUMENT_KEYS = {
  cod: [],
  card: [
    'issuers',
    'networks',
    'types',
    'iins',
    'countries',
    'cobranded_partners',
  ],
  emi: [
    'issuers',
    'networks',
    'types',
    'iins',
    'durations',
    'cobranded_partners',
  ],
  netbanking: ['banks'],
  fpx: ['banks'],
  emandate: ['banks'],
  wallet: ['wallets'],
  upi: ['flows', 'apps'],
  cardless_emi: ['providers'],
  paylater: ['providers'],
  bank_transfer: [],
  paypal: [],
  app: ['providers'],
  intl_bank_transfer: [],
};

const INSTRUMENT_CREATORS = {
  default: (instrument) => instrument,
  upi: (instrument) => {
    if (instrument.app) {
      instrument.app =
        getPackageNameFromShortcode(instrument.app) || instrument.app;
    }

    if (instrument.apps) {
      instrument.apps = instrument.apps.map((app) => {
        return getPackageNameFromShortcode(app) || app;
      });
    }

    return instrument;
  },
};

/**
 * Checks if the instrument has only the allowed keys
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
function hasOnlyAllowedKeys(instrument) {
  const { method } = instrument;

  if (!method) {
    return false;
  }

  const allowedKeys = PUBLIC_API_INSTRUMENT_KEYS[method];

  // If we don't have any specific whitelisted keys, reject this
  if (!allowedKeys) {
    return false;
  }

  // Removing 'method' because it is a common key
  const instrumentKeys = Object.keys(instrument).filter(
    (key) => key !== 'method'
  );

  // None of the instrumentKeys should be absent from allowedKeys
  const anyAbsent = instrumentKeys.some((key) => !allowedKeys.includes(key));

  if (anyAbsent) {
    return false;
  }

  // All keys must be arrays
  const allArrays = instrumentKeys.every((key) =>
    Array.isArray(instrument[key])
  );

  return allArrays;
}

/**
 * Creates an instrument from the instrument config
 * @param {Object} config
 *
 * @returns {Instrument|undefined}
 */
export function createInstrument(config) {
  const { method } = config;

  if (!method) {
    return;
  }

  const creator = INSTRUMENT_CREATORS[method] || INSTRUMENT_CREATORS.default;

  const instrument = addTypeAndCategory(creator(config));

  return instrument;
}

/**
 * Validates the keys of the instrument before
 * creating the instrument
 * @param {Object} config Instrument config
 *
 * @return {Instrument|undefined}
 */
export function validateKeysAndCreateInstrument(config) {
  if (!hasOnlyAllowedKeys(config)) {
    return;
  }

  return createInstrument(config);
}

/**
 * Tells whether or not the instrument denotes an entire method.
 * Checks if none of the keys for the instrument's method are present
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
export function isInstrumentForEntireMethod(instrument) {
  const method = instrument.method;
  const config = InstrumentsConfig[method];

  if (!config) {
    return false;
  }

  const currentInsturmentKeys = Object.keys(instrument);

  // None of the keys in the config should be present in the instrument
  return config.properties.every((key) => !currentInsturmentKeys.includes(key));
}

/**
 * Adds instrument data to payment payload
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 * @param {Customer} customer
 *
 * @returns {Object}
 */
export function addInstrumentToPaymentData(instrument, payment, customer) {
  const method = instrument.method;
  const config = InstrumentsConfig[method];

  if (!config) {
    return payment;
  }
  return config.getPaymentPayload(
    getExtendedSingleInstrument(instrument),
    payment,
    customer
  );
}

/**
 * Extends the instrument using the first ungrouped instrument
 * @param {Instrument} instrument
 *
 * @returns {Instrument}
 */
export function getExtendedSingleInstrument(instrument) {
  return Object.assign({}, instrument, instrument._ungrouped[0]);
}

/**
 * Tells whether an instrument is for saved cards
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
export function isSavedCardInstrument(instrument) {
  return ['card', 'emi'].includes(instrument.method) && instrument.token_id;
}

/**
 * Tells whether or not the instrument is a card instrument
 * to be used from inside the card tab
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
export function isInstrumentGrouped(instrument) {
  const isMethodInstrument = isInstrumentForEntireMethod(instrument);

  /**
   * All the methods that have a token.
   * UPI has tokens, but it needs some more checks on
   * the flows as well. It's not needed now, but we will eventually need to add it.
   *
   * TODO: Check for UPI in isMethodWithToken
   */
  const isMethodWithToken = ['card', 'emi'].includes(instrument.method);

  /**
   *  For emandate instrument view will always be grouped
   *  As in RadioInstrument view user will be redirected
   *  new page, which we want to ignore(Due to IFSC validation)
   */
  if (instrument.method === 'emandate') {
    return true;
  }
  if (isMethodInstrument) {
    return true;
  }

  if (isMethodWithToken) {
    const doesTokenExist = instrument.token_id;

    return !doesTokenExist;
  }

  if (instrument.method === 'upi' && instrument.flows) {
    // More than one flow always needs to go deeper
    if (instrument.flows.length > 1) {
      return true;
    }

    // UPI omnichannel always needs to go deeper
    if (instrument.flows.includes('omnichannel')) {
      return true;
    }

    /**
     * Collect needs to go deeper if this is not an individual
     * instrument with a VPA
     */
    if (instrument.flows.includes('collect')) {
      let ungrouped = instrument._ungrouped;

      // If individual, check for VPA
      if (ungrouped.length === 1) {
        const { flow, vpa } = ungrouped[0];

        if (flow === 'collect' && vpa) {
          return false;
        }
      }

      return true;
    }

    // If flow is intent and no apps are specified, go deeper
    if (instrument.flows.includes('intent') && !instrument.apps) {
      return true;
    }
  }

  return instrument._ungrouped.length > 1;
}
