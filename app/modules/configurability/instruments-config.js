import { AVAILABLE_METHODS } from 'common/constants';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';

const INTERNATIONAL_INSTRUMENT_CONFIG = {
  properties: ['providers'],
  payment: ['provider'],
  groupedToIndividual: (grouped) => {
    const base = ObjectUtils.clone(grouped);
    delete base.providers;

    return (grouped.providers || []).map((provider) => {
      return Object.assign(
        {
          provider,
        },
        base
      );
    });
  },
  isValid: (instrument) =>
    Boolean(instrument.providers) && instrument.providers.length > 0,
};

/**
 * Get the updated payment payload augmented with the given instrument
 * @param {Instrument} instrument
 * @param {Object} payment Payment payload
 * @param {Customer} customer
 *
 * @returns {Object} Payment payload
 */
function genericPaymentPayloadGetter(instrument, payment, customer) {
  payment = ObjectUtils.clone(payment);

  const method = instrument.method;
  const paymentKeys = config[method].payment;

  payment.method = method;

  paymentKeys.forEach((key) => {
    const value = instrument[key];

    if (!_.isUndefined(value)) {
      payment[key] = value;
    }
  });

  // Add a token
  if (instrument.token_id && customer) {
    const token = ObjectUtils.get(customer, 'tokens.items', []).find(
      (token) => token.id === instrument.token_id
    );

    if (token) {
      payment.token = token.token;
    }
  }

  return payment;
}

function genericIsValid() {
  return true;
}

export function genericGroupedToIndividual(grouped) {
  return [grouped];
}

/**
 * Creates a combinations of keys with array-like values
 * @param {Instrument} instrument
 * @param {Array<string>} sequence List of keys to make the combinations of
 *
 * @returns {Array<Object>}
 */
function createCombinations(instrument, sequence = []) {
  let soFar = [];

  sequence.forEach((key) => {
    const values = instrument[key];

    if (!values || !values.length) {
      return;
    }

    // "networks" -> "network"
    const singularKey = key.slice(0, -1);

    // If nothing has been pushed so far, this is the first key to be pushed
    if (soFar.length === 0) {
      soFar = values.map((value) => ({
        [singularKey]: value,
      }));
    } else {
      // Things have already been pushed so far, extend existing objects
      const _soFar = values.flatMap((value) => {
        return soFar.map((s) =>
          Object.assign(
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

const cardProperties = [
  'types',
  'iins',
  'issuers',
  'networks',
  'token_id',
  'countries',
];
const upiProperties = ['flows', 'apps', 'token_id', 'vpas'];
const config = {
  card: {
    properties: cardProperties,
    payment: ['token'],
    groupedToIndividual: (grouped, customer) => {
      const tokens = ObjectUtils.get(customer, 'tokens.items', []);
      const base = ObjectUtils.clone(grouped);

      // Remove all extra properties
      cardProperties.forEach((key) => {
        delete base[key];
      });

      if (grouped.token_id) {
        const token_id = grouped.token_id;
        const token = tokens.find((token) => token.id === token_id);

        if (token) {
          let instrumentFromToken = [
            Object.assign(
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

      return combinations.map((combination) =>
        Object.assign(combination, base)
      );
    },
    isValid: (instrument) => {
      if (instrument.token_id) {
      }

      const hasIssuers = Boolean(instrument.issuers);
      const hasNetworks = Boolean(instrument.networks);
      const hasTypes = Boolean(instrument.types);
      const hasCountries = Boolean(instrument.countries);

      if (hasIssuers && !instrument.issuers.length) {
        return false;
      }

      if (hasNetworks && !instrument.networks.length) {
        return false;
      }

      if (hasTypes && !instrument.types.length) {
        return false;
      }
      if (hasCountries && !instrument.countries.length) {
        return false;
      }
      return true;
    },
  },

  netbanking: {
    properties: ['banks'],
    payment: ['bank'],
    groupedToIndividual: (grouped) => {
      const base = ObjectUtils.clone(grouped);
      delete base.banks;

      return (grouped.banks || []).map((bank) => {
        return Object.assign(
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
      const base = ObjectUtils.clone(grouped);
      delete base.wallets;

      return (Array.isArray(grouped?.wallets) ? grouped.wallets : []).map(
        (wallet) => {
          return Object.assign(
            {
              wallet,
            },
            base
          );
        }
      );
    },
    isValid: (instrument) =>
      Boolean(instrument.wallets) && instrument.wallets.length > 0,
  },

  upi: {
    properties: upiProperties,
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

      const tokens = ObjectUtils.get(customer, 'tokens.items', []);
      const base = ObjectUtils.clone(grouped);

      // Remove all extra properties
      upiProperties.forEach((key) => {
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

      if (flows.includes('collect')) {
        if (vpas.length) {
          let individualInstruments = vpas.map((vpa) => {
            let individual = Object.assign(
              {
                vpa,
                flow: 'collect',
              },
              base
            );

            if (grouped.token_id) {
              const token_id = grouped.token_id;

              const token = tokens.find((token) => token.id === token_id);

              if (token) {
                individual.token_id = token_id;
              }
            }

            return individual;
          });

          ungrouped = ungrouped.concat(individualInstruments);
        }
      }

      if (flows.includes('intent')) {
        if (apps.length) {
          let individualInstruments = apps.map((app) =>
            Object.assign(
              {
                app,
                flow: 'intent',
              },
              base
            )
          );

          ungrouped = ungrouped.concat(individualInstruments);
        }
      }

      if (flows.length > 0) {
        let individualInstruments = flows
          .map((flow) => {
            let individual = Object.assign(
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
          })
          .filter(Boolean);

        ungrouped = ungrouped.concat(individualInstruments);
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

        if (!hasFlows || !instrument.flows.includes('intent')) {
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
      const base = ObjectUtils.clone(grouped);
      delete base.providers;

      return (grouped.providers || []).map((provider) => {
        return Object.assign(
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
      const base = ObjectUtils.clone(grouped);
      delete base.providers;

      return (grouped.providers || []).map((provider) => {
        return Object.assign(
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
      const base = ObjectUtils.clone(grouped);
      delete base.providers;

      return (grouped.providers || []).map((provider) => {
        return Object.assign(
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
  international: INTERNATIONAL_INSTRUMENT_CONFIG,
  intl_bank_transfer: INTERNATIONAL_INSTRUMENT_CONFIG,
  // TODO: Pending methods: emi
};

// FPX and netbanking share same config
config.fpx = config.netbanking;

// EMI and Cards are the same for now.
config.emi = config.card;
config.credit_card = config.card;
config.debit_card = config.card;

// UPI OTM is the same as UPI for now.
config.upi_otm = config.upi;

// netbanking and emandate validators are same
config.emandate = config.netbanking;

/**
 * This will set config as {} for methods that
 * do not have a specific config.
 *
 * eg: bank_transfer, paypal, gpay
 */
AVAILABLE_METHODS.forEach((method) => {
  if (!config[method]) {
    config[method] = {};
  }
});

ObjectUtils.loop(config, (val, method) => {
  config[method] = Object.assign(
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
