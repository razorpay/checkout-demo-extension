import { toLowerCaseSafe } from 'lib/utils';

/**
 * Get the updated payment payload augmented with the given instrument
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 * @param {Customer} customer
 *
 * @returns {Object} Payment payload
 */
function genericPaymentPayloadGetter(instrument, payment, customer) {
  payment = _Obj.clone(payment);

  const method = instrument.method;
  const paymentKeys = config[method].payment;

  payment.method = method;

  _Arr.loop(paymentKeys, key => {
    const value = instrument[key];

    if (!_.isUndefined(value)) {
      payment[key] = value;
    }
  });

  // Add a token
  if (instrument.token_id && customer) {
    const token =
      _Obj.getSafely(customer, 'tokens.items', [])
      |> _Arr.find(token => token.id === instrument.token_id);

    if (token) {
      payment.token = token.token;
    }
  }

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

  upi: {
    properties: ['flow', 'flows', 'app', 'apps', 'token_id', 'token_ids'],
    payment: ['flow', 'app', 'token', 'vpa'],
    groupedToIndividual: grouped => {
      // TODO

      return [grouped];
    },
    isIndividual: instrument => {
      const singleFlow =
        instrument.flow || _Obj.getSafely(instrument, 'flows', []).length === 1;

      const missingApp = !instrument.app && !instrument.apps;
      const singleApp =
        instrument.app || _Obj.getSafely(instrument, 'apps', []).length === 1;
      const singleorMissingApps = singleApp || missingApp;

      const missingToken = !instrument.token_id && !instrument.token_ids;
      const singleToken =
        instrument.token_id ||
        _Obj.getSafely(instrument, 'token_ids', []).length === 1;
      const singleorMissingTokens = singleToken || missingToken;

      return singleFlow && singleorMissingApps && singleorMissingTokens;
    },

    getPaymentPayload: (instrument, payment) => {
      payment = genericPaymentPayloadGetter(instrument, payment);

      // Collect is known as directpay
      if (payment.flow === 'collect') {
        payment.flow = 'directpay';
      }

      // QR is intent underneath
      if (payment.flow === 'qr') {
        payment['_[upiqr]'] = 1;

        payment.flow = 'intent';
      }

      // Set flow to a different property
      if (payment.flow) {
        payment['_[flow]'] = payment.flow;

        delete payment.flow;
      }

      // App is known by a different name
      if (payment.app) {
        payment.upi_app = app;

        delete payment.app;
      }

      return payment;
    },
  },

  paypal: {
    properties: [],
    payment: [],
    groupedToIndividual: grouped => [grouped],
    isIndividual: () => true,
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
