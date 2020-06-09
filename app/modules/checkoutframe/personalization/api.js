import { VPA_REGEX } from 'common/constants';
import { getUPIAppDataFromHandle } from 'common/upi';

const PREFERRED_INSTRUMENTS = {};

/**
 * Sets instruments for customer
 * @param {Customer} customer
 * @param {Array<ApiInstrument>} instruments
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function setInstrumentsForCustomer(customer, instruments, upiApps) {
  const transformedInstruments = _Arr.map(instruments, instrument =>
    transformInstrumentToStorageFormat(instrument, { upiApps })
  );

  PREFERRED_INSTRUMENTS[customer.contact] = transformedInstruments;

  return getInstrumentsForCustomer(customer);
}

/**
 * Returns instruments for customer
 * @param {Customer} customer
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function getInstrumentsForCustomer(customer) {
  return Promise.resolve(PREFERRED_INSTRUMENTS[customer.contact] || []);
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
};

function transformInstrumentToStorageFormat(instrument, data = {}) {
  if (API_INSTRUMENT_PAYMENT_ADDONS[instrument.method]) {
    API_INSTRUMENT_PAYMENT_ADDONS[instrument.method](instrument, data);
  }
  return instrument;
}
