const { interceptor } = require('../util');
const assert = require('../assert');

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
    assert.equal(
      URL.pathname,
      '/v1/preferences',
      'preferences route should be v1/preferences'
    );
    if (options.key) {
      assert.equal(
        options.key,
        params.key_id,
        'key_id should be present in preferences request'
      );
    } else {
      assert.notOk(
        params.key_id,
        `key_id shouldn't be there in preferences request`
      );
    }
    preferencesParams.forEach(param => {
      if (options[param]) {
        assert.equal(
          options[param],
          params[param],
          param + ' should be present in preferences request'
        );
      } else {
        assert.notProperty(
          params,
          param,
          param + ` shouldn't be there in preferences request`
        );
      }
    });
  });
  await respondJSON(preferences);
}

module.exports = {
  sendPreferences,
  makePreferences(overrides) {
    return {
      methods: {
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
