const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction with keyless transaction', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: true,
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
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'Wallet',
      'Wallet - Freecharge'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
  });
});
