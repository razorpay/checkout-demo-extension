const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationText,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      personalization: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationText(context, 'wallet');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
  });
});
