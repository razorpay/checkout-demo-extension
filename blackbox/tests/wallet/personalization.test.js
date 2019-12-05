const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
} = require('../../actions/common');

describe.skip('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888885');
    await assertPaymentMethodsPersonalization(context);
    await delay(1000);
    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context, '5555');
    await handleValidationRequest(context, 'pass');
  });
});
