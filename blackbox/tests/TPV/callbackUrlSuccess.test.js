const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  handleCardValidationWithCallback,
  expectMockSuccessWithCallback,
} = require('../../actions/common');

describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with callback url', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        currency: 'INR',
        account_unmber: '1234567891234567',
        bank: 'SBIN',
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await handleCardValidationWithCallback(context);
    await expectMockSuccessWithCallback(context);
  });
});
