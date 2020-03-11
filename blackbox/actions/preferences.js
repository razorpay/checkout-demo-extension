const {
  interceptor,
  chrnum,
  randomBool,
  randomItem,
  randomEmail,
  randomContact,
  randomId,
  randomName,
  randomString,
} = require('../util');

const netbanking = require('../data/banks.json');
const wallet = require('../data/wallets.json');
const recurring = require('../data/recurring.json');
const emi_options = require('../data/emi.json');
const card = require('../data/cards.json');

const cardNetworks = ['MasterCard', 'Visa'];

const cardTypes = ['credit', 'debit'];

const preferencesParams = [
  'currency',
  'order_id',
  'customer_id',
  'invoice_id',
  'payment_link_id',
  'subscription_id',
  'recurring',
  'subscription_card_change',
  'account_id',
  'contact_id',
];

async function sendPreferences({
  expectRequest,
  respondJSON,
  options,
  preferences,
}) {
  await expectRequest(({ URL, params }) => {
    expect(URL.pathname).toEqual('/v1/preferences');

    if (options.key) {
      expect(options.key).toEqual(params.key_id);
    } else {
      expect(params).not.toHaveProperty('key_id');
    }

    preferencesParams.forEach(param => {
      if (options[param]) {
        expect(options[param]).toEqual(params[param]);
      } else {
        expect(params).not.toHaveProperty(param);
      }
    });
  });
  await respondJSON(preferences);
}

function makePreferences(overrides) {
  return {
    options: {},
    features: {
      save_vpa: true,
    },
    methods: {
      emi: true,
      emi_subvention: 'customer',
      ...card,
      wallet,
      netbanking,
      emi_options,
      recurring,
      upi_intent: true,
    },
    ...overrides,
  };
}

module.exports = {
  sendPreferences,
  makePreferences,

  makePreferencesLogged(overrides) {
    return {
      ...makePreferences(overrides),
      customer: {
        email: randomEmail(),
        contact: randomContact(),
        tokens: {
          count: 2,
          entity: 'collection',
          items: [
            {
              token: 'token_' + randomId(),
              card: {
                name: randomName(),
                last4: randomString(chrnum)(4),
                network: randomItem(cardNetworks),
                type: randomItem(cardTypes),
                issuer: randomItem(Object.keys(netbanking)),
                international: randomBool(),
              },
              method: 'card',
            },
            {
              auth_type: null,
              bank: null,
              created_at: 1579513972,
              entity: 'token',
              id: 'token_E6ggSqoaxSnzQc',
              method: 'upi',
              mrn: null,
              recurring: false,
              recurring_details: {
                status: 'not_applicable',
                failure_reason: null,
              },
              start_time: null,
              token: 'BrLOcWE6Mu9kLB',
              used_at: 1579513972,
              vpa: {
                username: 'saranshgupta1995',
                handle: 'okhdfcbank',
                name: null,
              },
              wallet: null,
            },
          ],
        },
      },
    };
  },
};
