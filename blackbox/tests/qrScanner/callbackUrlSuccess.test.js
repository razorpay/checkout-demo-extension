const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  enterCardDetails,
  handleCardValidationWithCallback,
  expectMockSuccessWithCallback,
} = require('../../actions/common');

describe.skip('QR Code Test Case for callback URL', () => {
  test('perform successful QR Code with callback URL', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
      method: {
        qr: true,
      },
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidationWithCallback(context);
    await expectMockSuccessWithCallback(context);
  });
});
