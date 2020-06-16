import { VPA_REGEX } from 'common/constants';
import { getUPIAppDataFromHandle } from 'common/upi';
import { getUPIIntentApps } from 'checkoutstore/native';

const PREFERRED_INSTRUMENTS_CACHE = {};

/**
 * Sets instruments for customer
 * @param {Customer} customer
 * @param {Array<ApiInstrument>} instruments
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function setInstrumentsForCustomer(customer, instruments) {
  const transformedInstruments = _Arr.map(instruments, instrument =>
    transformInstrumentToStorageFormat(instrument, {
      upiApps: getUPIIntentApps().filtered,
    })
  );

  PREFERRED_INSTRUMENTS_CACHE[customer.contact] = Promise.resolve(
    transformedInstruments
  );

  return getInstrumentsForCustomer(customer);
}

function getInstrumentsFromApi(customer) {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      const apiInstruments = [];

      setInstrumentsForCustomer(customer, apiInstruments);

      resolve(getInstrumentsForCustomer(customer));
    }, 0);
  });

  PREFERRED_INSTRUMENTS_CACHE[customer.contact] = promise;

  return promise;
}

/**
 * Returns instruments for customer
 * @param {Customer} customer
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function getInstrumentsForCustomer(customer) {
  const cached = PREFERRED_INSTRUMENTS_CACHE[customer.contact];

  if (cached) {
    return cached;
  } else {
    return getInstrumentsFromApi(customer);
  }
}

const API_INSTRUMENT_PAYMENT_ADDONS = {
  upi: instrument => {
    const validVpa = VPA_REGEX.test(instrument.vpa);
    if (validVpa) {
      instrument['_[flow]'] = 'directpay';
    } else {
      const app = getUPIAppDataFromHandle(instrument.vpa.slice(1));
      if (app) {
        instrument['_[flow]'] = 'intent';
        instrument['upi_app'] = app.package_name;
      }
    }
  },
  wallet: instrument => {
    instrument.wallet = instrument.instrument;
    delete instrument.instrument;
  },
  netbanking: instrument => {
    instrument.bank = instrument.instrument;
    delete instrument.instrument;
  },
  card: instrument => {
    instrument.token_id = instrument.instrument;
    delete instrument.instrument;
  },
};

/**
 * To consume the backend representation of the p13n instruments, we need to, currently, convert them into the existing, supported p13n instrument format which is consumed in configurability.
 * With this, the translation flow looks like Backend format -> localStorage format -> Configurability, which seems fine in the short run.
 * In the longer run though, when we decide to deprecate v1, it should get consumed directly by configurability.
 * @param {Object} instrument An instrument recieved from the api
 * @param {Object} data Any extra data that is needed to transform
 */
export function transformInstrumentToStorageFormat(instrument, data = {}) {
  if (API_INSTRUMENT_PAYMENT_ADDONS[instrument.method]) {
    API_INSTRUMENT_PAYMENT_ADDONS[instrument.method](instrument, data);
  }
  return instrument;
}
