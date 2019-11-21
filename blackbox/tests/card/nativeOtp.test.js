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
  typeOTPandSubmit,
  verifyOTP,
  resendOTP,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction with native otp flow', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
      callback_url: 'https://google.com',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidationForNativeOTP(context, { coproto: 'otp' });
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'fail');
    await resendOTP(context);
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'pass');
  });
});
