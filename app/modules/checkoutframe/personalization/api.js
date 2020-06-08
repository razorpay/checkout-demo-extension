const PREFERRED_INSTRUMENTS = {};

/**
 * Sets instruments for customer
 * @param {Customer} customer
 * @param {Array<ApiInstrument>} instruments
 *
 * @returns {Promise<Array<StorageInstrument>>}
 */
export function setInstrumentsForCustomer(customer, instruments) {
  const transformedInstruments = _Arr.map(
    instruments,
    transformInstrumentToStorageFormat
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

function transformInstrumentToStorageFormat(instrument) {
  // TODO
  return instrument;
}
