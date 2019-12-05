const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  handleUPIAccountValidation,
  verifyPersonalizationVPAText,
  selectPersonalizationPaymentMethod,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('Basic upi payment', () => {
  test('Perform upi collect transaction with callbackURL and personalization enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationVPAText(context);
    await selectPersonalizationPaymentMethod(context, 1);
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
