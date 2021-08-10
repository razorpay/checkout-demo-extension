import { AVAILABLE_METHODS } from 'common/constants';

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

  _Arr.loop(paymentKeys, (key) => {
    const value = instrument[key];

    if (!_.isUndefined(value)) {
      payment[key] = value;
    }
  });

  // Add a token
  if (instrument.token_id && customer) {
    const token =
      _Obj.getSafely(customer, 'tokens.items', [])
      |> _Arr.find((token) => token.id === instrument.token_id);

    if (token) {
      payment.token = token.token;
    }
  }

  return payment;
}

function genericIsValid(instrument) {
  return true;
}

export function genericGroupedToIndividual(grouped, customer) {
  return [grouped];
}

/**
 * Creates a combinations of keys with array-like values
 * @param {Instrument} instrument
 * @param {Array<string>} sequence List of keys to make the combinations of
 *
 * @returns {Array<Object>}
 */
function createCombinations(instrument, sequence) {
  let soFar = [];

  _Arr.loop(sequence, (key) => {
    const values = instrument[key];

    if (!values || !values.length) {
      return;
    }

    // "networks" -> "network"
    const singularKey = key.slice(0, -1);

    // If nothing has been pushed so far, this is the first key to be pushed
    if (soFar.length === 0) {
      soFar = _Arr.map(values, (value) => ({
        [singularKey]: value,
      }));
    } else {
      // Things have already been pushed so far, extend existing objects
      const _soFar = _Arr.flatMap(values, (value) => {
        return _Arr.map(soFar, (s) =>
          _Obj.extend(
            {
              [singularKey]: value,
            },
            s
          )
        );
      });

      soFar = _soFar;
    }
  });

  return soFar;
}

const config = {
  card: {
    properties: ['types', 'iins', 'issuers', 'networks', 'token_id'],
    payment: ['token'],
    groupedToIndividual: (grouped, customer) => {
      const tokens = _Obj.getSafely(customer, 'tokens.items', []);
      const base = _Obj.clone(grouped);

      // Remove all extra properties
      _Arr.loop(['types', 'iins', 'issuers', 'networks', 'token_id'], (key) => {
        delete base[key];
      });

      if (grouped.token_id) {
        const token_id = grouped.token_id;
        const token = _Arr.find(tokens, (token) => token.id === token_id);

        if (token) {
          let instrumentFromToken = [
            _Obj.extend(
              {
                token_id,
                type: token.card.type,
                issuer: token.card.issuer,
                network: token.card.network,
              },
              base
            ),
          ];

          return instrumentFromToken;
        }
      }

      const combinations = createCombinations(grouped, [
        'issuers',
        'networks',
        'types',
        'iins',
      ]);

      return _Arr.map(combinations, (combination) =>
        _Obj.extend(combination, base)
      );
    },
    isValid: (instrument) => {
      if (instrument.token_id) {
      }

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
  },

  netbanking: {
    properties: ['banks'],
    payment: ['bank'],
    groupedToIndividual: (grouped) => {
      const base = _Obj.clone(grouped);
      delete base.banks;

      return _Arr.map(grouped.banks || [], (bank) => {
        return _Obj.extend(
          {
            bank,
          },
          base
        );
      });
    },
    isValid: (instrument) =>
      Boolean(instrument.banks) && instrument.banks.length > 0,
  },

  wallet: {
    properties: ['wallets'],
    payment: ['wallet'],
    groupedToIndividual: (grouped) => {
      const base = _Obj.clone(grouped);
      delete base.wallets;

      return _Arr.map(grouped.wallets || [], (wallet) => {
        return _Obj.extend(
          {
            wallet,
          },
          base
        );
      });
    },
    isValid: (instrument) =>
      Boolean(instrument.wallets) && instrument.wallets.length > 0,
  },

  upi: {
    properties: ['flows', 'apps', 'token_id', 'vpas'],
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
      let vpas = [];

      let ungrouped = [];

      const tokens = _Obj.getSafely(customer, 'tokens.items', []);
      const base = _Obj.clone(grouped);

      // Remove all extra properties
      _Arr.loop(['flows', 'apps', 'token_id', 'vpas'], (key) => {
        delete base[key];
      });

      if (grouped.flows) {
        flows = grouped.flows;
      }

      if (grouped.vpas) {
        vpas = grouped.vpas;
      }

      if (grouped.apps) {
        apps = grouped.apps;
      }

      if (_Arr.contains(flows, 'collect')) {
        if (vpas.length) {
          let individualInstruments = _Arr.map(vpas, (vpa) => {
            let individual = _Obj.extend(
              {
                vpa,
                flow: 'collect',
              },
              base
            );

            if (grouped.token_id) {
              const token_id = grouped.token_id;

              const token = _Arr.find(tokens, (token) => token.id === token_id);

              if (token) {
                individual.token_id = token_id;
              }
            }

            return individual;
          });

          ungrouped = _Arr.mergeWith(ungrouped, individualInstruments);
        }
      }

      if (_Arr.contains(flows, 'intent')) {
        if (apps.length) {
          let individualInstruments = _Arr.map(apps, (app) =>
            _Obj.extend(
              {
                app,
                flow: 'intent',
              },
              base
            )
          );

          ungrouped = _Arr.mergeWith(ungrouped, individualInstruments);
        }
      }

      if (flows.length > 0) {
        let individualInstruments =
          _Arr.map(flows, (flow) => {
            let individual = _Obj.extend(
              {
                flow,
              },
              base
            );

            // Allow intent only if no apps are present
            if (flow === 'intent' && apps.length) {
              return;
            }

            // Allow collect only if no VPAs are present
            if (flow === 'collect' && vpas.length) {
              return;
            }

            return individual;
          }) |> _Arr.filter(Boolean);

        ungrouped = _Arr.mergeWith(ungrouped, individualInstruments);
      }

      return ungrouped;
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
    isValid: (instrument) => {
      const hasFlows = Boolean(instrument.flows);
      const hasApps = Boolean(instrument.apps);

      // Flows is mandatory
      if (!hasFlows || !instrument.flows.length) {
        return false;
      }

      if (hasApps) {
        if (!instrument.apps.length) {
          return false;
        }

        if (!hasFlows || !_Arr.contains(instrument.flows, 'intent')) {
          return false;
        }
      }

      return true;
    },
  },

  cardless_emi: {
    properties: ['providers'],
    payment: ['provider'],
    groupedToIndividual: (grouped) => {
      const base = _Obj.clone(grouped);
      delete base.providers;

      return _Arr.map(grouped.providers || [], (provider) => {
        return _Obj.extend(
          {
            provider,
          },
          base
        );
      });
    },
    isValid: (instrument) =>
      Boolean(instrument.providers) && instrument.providers.length > 0,
  },

  paylater: {
    properties: ['providers'],
    payment: ['provider'],
    groupedToIndividual: (grouped) => {
      const base = _Obj.clone(grouped);
      delete base.providers;

      return _Arr.map(grouped.providers || [], (provider) => {
        return _Obj.extend(
          {
            provider,
          },
          base
        );
      });
    },
    isValid: (instrument) =>
      Boolean(instrument.providers) && instrument.providers.length > 0,
  },

  app: {
    properties: ['providers'],
    payment: ['provider'],
    groupedToIndividual: (grouped) => {
      const base = _Obj.clone(grouped);
      delete base.providers;

      return _Arr.map(grouped.providers || [], (provider) => {
        return _Obj.extend(
          {
            provider,
          },
          base
        );
      });
    },
    isValid: (instrument) =>
      Boolean(instrument.providers) && instrument.providers.length > 0,
  },
  // TODO: Pending methods: emi
};

// EMI and Cards are the same for now.
config.emi = config.card;
config.credit_card = config.card;
config.debit_card = config.card;

// UPI OTM is the same as UPI for now.
config.upi_otm = config.upi;

/**
 * This will set config as {} for methods that
 * do not have a specific config.
 *
 * eg: bank_transfer, paypal, gpay
 */
_Arr.loop(AVAILABLE_METHODS, (method) => {
  if (!config[method]) {
    config[method] = {};
  }
});

_Obj.loop(config, (val, method) => {
  config[method] = _Obj.extend(
    {
      getPaymentPayload: genericPaymentPayloadGetter,
      groupedToIndividual: genericGroupedToIndividual,
      isValid: genericIsValid,
      properties: [],
      payment: [],
    },
    config[method]
  );
});

export default config;
