const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationText,
  submit,
  handleUPIAccountValidation,
  selectPersonalizationPaymentMethod,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('GooglePay with Personalization  payment', () => {
  test('Perform GooglePay with Personalization and Callback Url transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
      personalization: true,
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
    await verifyPersonalizationText(context, 'upi');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
