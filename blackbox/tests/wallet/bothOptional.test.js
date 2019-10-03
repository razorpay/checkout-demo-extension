const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay, visible } = require('../../util');

describe('Basic wallet payment', () => {
  test('Perform wallet transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckout({ page, options, preferences });
    expect(await page.$eval('[name=contact]', visible)).toEqual(false);
    expect(await page.$eval('[name=email]', visible)).toEqual(false);
  });
});
