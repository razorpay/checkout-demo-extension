const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { expectRedirectWithCallback } = require('../../actions/common');

describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with callback url and optional contact', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 20000,
        currency: 'INR',
        account_number: '1234567891234567',
        bank: 'SBIN',
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'SBIN',
    });
  });
});
