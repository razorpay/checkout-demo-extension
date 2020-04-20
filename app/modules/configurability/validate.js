const PAYMENT_VALIDATORS = {
  netbanking: (payment, instrument) => {
    if (!instrument.banks) {
      return true;
    }

    return _Arr.contains(instrument.banks, payment.bank);
  },
};

/**
 * Checks if the instrument is valid for the payment payload
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 *
 * @returns {Promise<boolean>}
 */
export function isInstrumentValidForPayment(instrument, payment) {
  const validator = PAYMENT_VALIDATORS[instrument.method];

  if (!validator) {
    return Promise.resolve(false); // Should reject but we'd need to polyfill Promise.allSettled for getValidPaymentInstruments
  }

  const validated = validator(payment, instrument);

  return Promise.resolve(validated);
}

/**
 * Returns the valid payment instruments
 * @param {Object} payment Payment payload
 * @param {Array<Instrument>} instruments
 *
 * @returns {Promise<Array<Instrument>>}
 */
export function getValidPaymentInstruments(payment, instruments) {
  const methodInstruments = _Arr.filter(
    instruments,
    instrument => instrument.method === payment.method
  );

  const promises = _Arr.map(methodInstruments, instrument =>
    isInstrumentValidForPayment(instrument, payment)
  );

  return Promise.all(promises).then(instrumentValidities => {
    let validInstruments = [];

    _Arr.loop(instrumentValidities, (valid, index) => {
      if (valid) {
        validInstruments.push(methodInstruments[index]);
      }

      return validInstruments;
    });
  });
}
