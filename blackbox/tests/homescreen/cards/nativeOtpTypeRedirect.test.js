const { makePreferences } = require('../../../actions/preferences');
const {
  submit,
  enterCardDetails,
  handleCardValidationForNativeOTP,
} = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openSdkCheckoutWithNewHomeScreen } = require('../open');

describe('Card tests', () => {
  test('perform card transaction with native otp flow - type redirect response', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openSdkCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidationForNativeOTP(context, { coproto: 'redirect' });
    const request = await context.expectRequest();
    expect(request.url).toEqual(
      'https://api.razorpay.com/v1/payments/K1rL2EogDLgqFZ/authenticate'
    );
    expect(request.method.toLowerCase()).toEqual('post');
    await context.respondHTML('');
  });
});
