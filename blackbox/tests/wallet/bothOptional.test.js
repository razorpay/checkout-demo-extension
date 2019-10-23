const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { assertHomePage } = require('../../actions/common');

describe('Wallet payment', () => {
  test('Perform wallet transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, false, false);
  });
});
