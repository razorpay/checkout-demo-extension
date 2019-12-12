const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleCustomerCardStatusRequest,
  handleValidationRequest,
  verifyPayLaterOTP,
  typeOTPandSubmit,
  handleFeeBearer,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction with feebearer payment enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
    preferences.methods.paylater = { epaylater: true };
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context, '0007');
    await handleCustomerCardStatusRequest(context);
    await verifyPayLaterOTP(context);
    await handleFeeBearer(context);
    await handleValidationRequest(context, 'pass');
  });
});
