const { openCheckout } = require('../../actions/checkout');
const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  enterCardDetails,
  handleCardValidationForNativeOTP,
  handleMockSuccessDialog,
} = require('../../actions/common');

describe('Card tests', () => {
  test('avoid native otp flow in non-redirect mode', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidationForNativeOTP(context, {
      urlShouldContain: 'create/ajax',
    });
    await handleMockSuccessDialog(context);
  });
});
