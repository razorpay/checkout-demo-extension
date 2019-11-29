const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
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
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888885');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'UPI',
      'UPI - scbaala@okhdfcbank'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfc');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
