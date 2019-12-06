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
  handleFeeBearer,
} = require('../../actions/common');

describe('Wallet with Personalization payment', () => {
  test('Perform Wallet with Personalization and feebearer transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: true,
    };
    const preferences = makePreferences({ fee_bearer: true });
    preferences.methods.upi = true;
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
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
  });
});
