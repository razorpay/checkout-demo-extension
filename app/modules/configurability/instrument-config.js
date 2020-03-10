/**
 * Get the updated payment payload augmented with the given instrument
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 *
 * @returns {Object} Payment payload
 */
function genericPaymentPayloadGetter(instrument, payment) {
  payment = _Obj.clone(payment);

  const method = instrument.method;
  const paymentKeys = config[method].payment;

  _Obj.loop(paymentKeys, (val, key) => {
    if (!_.isUndefined(val)) {
      payment[key] = val;
    }
  });

  return payment;
}

/**
 * Tells whether or the instrument is on a granular level.
 * These type of instruments can be directly used to make payments.
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
function genericIsIndividual(instrument) {
  const method = instrument.method;
  const paymentKeys = config[method].payment;

  return _Arr.any(paymentKeys, key => instrument[key]);
}

const config = {
  card: {
    properties: [
      'card_type',
      'card_types',
      'iin',
      'iins',
      'issuer',
      'issuers',
      'network',
      'networks',
      'token_id',
      'token_ids',
    ],
    payment: ['token'],
  },

  netbanking: {
    properties: ['bank', 'banks'],
    payment: ['bank'],
  },

  wallet: {
    properties: ['wallet', 'wallets'],
    payment: ['wallet'],
  },

  // TODO: Add more methods
};

_Obj.loop(config, (val, method) => {
  config[method].getPaymentPayload =
    config[method].getPaymentPayload || genericPaymentPayloadGetter;
  config[method].isIndividual =
    config[method].isIndividual || genericIsIndividual;
});

export default config;
