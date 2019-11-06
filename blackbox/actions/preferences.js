const { interceptor } = require('../util');

const netbanking = require('../data/banks.json');
const wallet = require('../data/wallets.json');
const recurring = require('../data/recurring.json');
const emi_options = require('../data/emi.json');
const card = require('../data/cards.json');

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

module.exports = {
  sendPreferences,
  makePreferences(overrides) {
    return {
      options: {},
      methods: {
        emi: true,
        emi_subvention: 'customer',
        ...card,
        wallet,
        netbanking,
        emi_options,
        recurring,
      },
      ...overrides,
    };
  },
};
