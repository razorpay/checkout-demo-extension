const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPaymentMethodText,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  paymentMethodsSelection,
} = require('../../actions/common');

describe.skip('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888885');
    await verifyPaymentMethodText(context, 'Wallet', 'Wallet - Freecharge');
    await paymentMethodsSelection(context);
    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
  });
});
