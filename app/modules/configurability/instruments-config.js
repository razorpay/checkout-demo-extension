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

function genericIsValid(instrument) {
  return true;
}

function genericGroupedToIndividual(grouped, customer) {
  return [grouped];
}

const config = {
  card: {
    properties: [
      'type',
      'types',
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
    groupedToIndividual: (grouped, customer) => {
      const tokens = _Obj.getSafely(customer, 'tokens.items', []);
      const base = _Obj.clone(grouped);
      let token_ids = [];

      // Convert single token_id into token_ids
      if (grouped.token_ids) {
        token_ids = grouped.token_ids;
      } else if (grouped.token_id) {
        token_ids = [grouped.token_id];
      }

      delete base.token_ids;

      if (token_ids.length > 0) {
        return (
          _Arr.map(token_ids, token_id => {
            const token = _Arr.find(tokens, token => token.id === token_id);

            if (!token) {
              return;
            }

            return _Obj.extend(
              {
                token_id,
                type: token.card.type,
                issuer: token.card.issuer,
                network: toLowerCaseSafe(token.card.network),
              },
              base
            );
          }) |> _Arr.filter(Boolean)
        );
      }

      return [grouped];
    },
    isValid: instrument => {
      const hasIssuers = Boolean(instrument.issuers);
      const hasNetworks = Boolean(instrument.networks);
      const hasTypes = Boolean(instrument.types);

      if (hasIssuers && !instrument.issuers.length) {
        return false;
      }

      if (hasNetworks && !instrument.networks.length) {
        return false;
      }

      if (hasTypes && !instrument.types.length) {
        return false;
      }

      return true;
    },
    isIndividual: instrument =>
      instrument.token_id && (instrument.network || instrument.issuer),
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
    isIndividual: instrument => instrument.bank,
    isValid: instrument =>
      Boolean(instrument.bank) ||
      (Boolean(instrument.banks) && instrument.banks.length > 0),
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
    isIndividual: instrument => instrument.wallet,
    isValid: instrument =>
      Boolean(instrument.wallet) ||
      (Boolean(instrument.wallets) && instrument.wallets.length > 0),
  },

  upi: {
    properties: ['flow', 'flows', 'app', 'apps', 'token_id', 'token_ids'],
    payment: ['flow', 'app', 'token', 'vpa'],
    groupedToIndividual: (grouped, customer) => {
      /**
       * For UPI apps, ungrouping works in the following way:
       * - If token_id or token_ids are present, use tokens and force flow=collect
       * - If app or apps are present, use apps and force flow=intent
       * - Ungroup flows and discard apps
       */

      let flows = [];
      let apps = [];
      let token_ids = [];

      const tokens = _Obj.getSafely(customer, 'tokens.items', []);
      const base = _Obj.clone(grouped);

      // Remove all extra properties
      _Arr.loop(
        ['flow', 'flows', 'app', 'apps', 'token_id', 'token_ids'],
        key => {
          delete base[key];
        }
      );

      if (grouped.token_ids) {
        token_ids = grouped.token_ids;
      } else if (grouped.token_id) {
        token_ids = [grouped.token_id];
      }

      if (token_ids.length > 0) {
        return (
          _Arr.map(token_ids, token_id => {
            const token = _Arr.find(tokens, token => token.id === token_id);

            if (!token) {
              return;
            }

            return _Obj.extend(
              {
                token_id,
                flow: 'collect',
              },
              base
            );
          }) |> _Arr.filter(Boolean)
        );
      }

      if (grouped.apps) {
        apps = grouped.apps;
      } else if (grouped.app) {
        apps = [grouped.app];
      }

      if (apps.length > 0) {
        return _Arr.map(apps, app =>
          _Obj.extend(
            {
              app,
              flow: 'intent',
            },
            base
          )
        );
      }

      if (grouped.flows) {
        flows = grouped.flows;
      } else if (grouped.flow) {
        flows = [grouped.flow];
      }

      if (flows.length > 0) {
        return _Arr.map(flows, flow =>
          _Obj.extend(
            {
              flow,
            },
            base
          )
        );
      }

      return [grouped];
    },
    isIndividual: instrument => {
      const singleFlow = instrument.flow;

      const missingApp = !instrument.app && !instrument.apps;
      const singleApp = instrument.app;
      const singleorMissingApps = singleApp || missingApp;

      const missingToken = !instrument.token_id && !instrument.token_ids;
      const singleToken = instrument.token_id;
      const singleorMissingTokens = singleToken || missingToken;

      return singleFlow && singleorMissingApps && singleorMissingTokens;
    },

    getPaymentPayload: (instrument, payment, customer) => {
      payment = genericPaymentPayloadGetter(instrument, payment, customer);

      // Collect is known as directpay
      if (payment.flow === 'collect') {
        payment.flow = 'directpay';

        // If `token` and `vpa` both exist, keep only `token`
        if (payment.token && payment.vpa) {
          delete payment.vpa;
        }
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
        payment.upi_app = payment.app;

        delete payment.app;
      }

      return payment;
    },
    isValid: instrument => {
      // TODO
      return true;
    },
  },

  paypal: {
    isIndividual: () => true,
  },

  cardless_emi: {
    properties: ['provider', 'providers'],
    payment: ['provider'],
    isIndividual: instrument => instrument && instrument.provider,
    groupedToIndividual: grouped => {
      const base = _Obj.clone(grouped);
      delete base.providers;

      return _Arr.map(grouped.providers || [], provider => {
        return _Obj.extend(
          {
            provider,
          },
          base
        );
      });
    },
    isValid: instrument =>
      Boolean(instrument.provider) ||
      (Boolean(instrument.providers) && instrument.providers.length > 0),
  },

  paylater: {
    properties: ['provider', 'providers'],
    payment: ['provider'],
    isIndividual: instrument => instrument && instrument.provider,
    groupedToIndividual: grouped => {
      const base = _Obj.clone(grouped);
      delete base.providers;

      return _Arr.map(grouped.providers || [], provider => {
        return _Obj.extend(
          {
            provider,
          },
          base
        );
      });
    },
    isValid: instrument =>
      Boolean(instrument.provider) ||
      (Boolean(instrument.providers) && instrument.providers.length > 0),
  },

  bank_transfer: {
    isIndividual: () => false,
  },

  // TODO: Pending methods: emi, gpay
};

// EMI and Cards are the same for now.
config.emi = config.card;

_Obj.loop(config, (val, method) => {
  config[method] = _Obj.extend(
    {
      getPaymentPayload: genericPaymentPayloadGetter,
      isIndividual: genericIsIndividual,
      groupedToIndividual: genericGroupedToIndividual,
      isValid: genericIsValid,
      properties: [],
      payment: [],
    },
    config[method]
  );
});

export default config;
