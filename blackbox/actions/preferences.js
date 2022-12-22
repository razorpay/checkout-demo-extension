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
const emi_options = require('../data/emi_options.json');
const emi_plans = require('../data/emi_plans.json');
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
  getRequest,
}) {
  const reqData = await expectRequest(({ URL, params }) => {
    expect(URL.pathname).toEqual('/v1/preferences');

    if (options.key) {
      expect(options.key).toEqual(params.key_id);
    } else {
      expect(params).not.toHaveProperty('key_id');
    }

    preferencesParams.forEach((param) => {
      if (options[param]) {
        expect(options[param]).toEqual(params[param]);
      } else {
        expect(params).not.toHaveProperty(param);
      }
    });
  });
  getRequest(reqData.URL.pathname);
  await respondJSON(preferences);
}

function makePreferences(overrides) {
  const isEmailOptional =
    overrides && overrides.optional
      ? overrides.optional.includes('email')
      : false;
  return {
    options: {},

    feature_overrides: {},
    methods: {
      cod: true,
      emi: true,
      emi_subvention: 'customer',
      ...card,
      wallet,
      netbanking,
      emi_options,
      emi_plans,
      recurring,
      upi_intent: true,
    },
    ...overrides,
    features: {
      save_vpa: true,
      show_email_on_checkout: true,
      email_optional_oncheckout: isEmailOptional,
      ...(overrides && overrides.features ? overrides.features : {}),
    },
  };
}

module.exports = {
  sendPreferences,
  makePreferences,
  preferencesParams,

  makePreferencesLogged(overrides, addresses = [], consentBannerViews) {
    const token = randomId();
    return {
      ...makePreferences(overrides),
      preferred_methods: {
        '+918888888881': [
          { method: 'upi', instrument: 'dfs@okicici', score: 0.3 },
          {
            instrument: 'F1lKrOrLTkTpyJ',
            method: 'card',
            issuer: 'UTIB',
            network: 'MasterCard',
            type: 'debit',
            score: 1,
          },
        ],
        '+919999289274': [
          { method: 'upi', instrument: 'saransh@ybl', score: 0.3 },
          {
            instrument: 'F1lKrOrLTkTpyJ',
            method: 'card',
            issuer: 'UTIB',
            network: 'MasterCard',
            type: 'debit',
            score: 1,
          },
        ],
      },
      customer: {
        '1cc_consent_banner_views': consentBannerViews,
        email: randomEmail(),
        contact: randomContact(),
        addresses,
        tokens: {
          count: 2,
          entity: 'collection',
          items: [
            {
              id: 'token_' + token,
              token,
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
                username: 'dsd',
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
