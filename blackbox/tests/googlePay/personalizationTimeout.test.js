const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  verifyTimeout,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction with timeout', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      timeout: 10,
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
    await verifyTimeout(context, 'upi');
  });
});
