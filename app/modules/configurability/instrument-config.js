import { toLowerCaseSafe } from 'lib/utils';

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
    groupedToIndividual: (grouped, { tokens = [] } = {}) => {
      if (!grouped.token_ids) {
        return [grouped];
      }

      const base = _Obj.clone(grouped);
      delete base.token_ids;

      return _Arr.map(grouped.token_ids, token_id => {
        const token = _Arr.find(tokens, token => token.id === token_id);

        return _Obj.extend(
          {
            token_id,
            card_type: token.type,
            issuer: token.issuer,
            network: toLowerCaseSafe(token.network),
          },
          base
        );
      });
    },
  },

  netbanking: {
    properties: ['bank', 'banks'],
    payment: ['bank'],
    groupedToIndividual: grouped => {
      const base = _Obj.clone(grouped);
      delete base.banks;

      return _Arr.map(grouped.banks || [], bank => {
        return _Obj.extend(
          {
            bank,
          },
          base
        );
      });
    },
    isIndividual: instrument =>
      instrument.bank || _Obj.getSafely(instrument, 'banks', []).length === 1,
  },

  wallet: {
    properties: ['wallet', 'wallets'],
    payment: ['wallet'],
    groupedToIndividual: grouped => {
      const base = _Obj.clone(grouped);
      delete base.wallets;

      return _Arr.map(grouped.wallets || [], wallet => {
        return _Obj.extend(
          {
            wallet,
          },
          base
        );
      });
    },
    isIndividual: instrument =>
      instrument.wallet ||
      _Obj.getSafely(instrument, 'wallets', []).length === 1,
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
