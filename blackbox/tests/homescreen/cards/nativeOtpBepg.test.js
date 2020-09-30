const { makePreferences } = require('../../../actions/preferences');
const {
  submit,
  enterCardDetails,
  handleCardValidationForNativeOTP,
  typeOTPandSubmit,
  verifyOTP,
  resendOTP,
  assertOTPElementsForBEPG,
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
  assertTrimmedInnerText,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe('Card tests', () => {
  test('perform card transaction with native otp flow - bepg', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
      callback_url: 'https://google.com',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckoutWithNewHomeScreen({
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

    await enterCardDetails(context, { nativeOtp: true, cardType: 'RUPAY' });
    await submit(context);

    await handleCardValidationForNativeOTP(context, {
      coproto: 'otp',
      cardType: 'RUPAY',
    });

    await assertOTPElementsForBEPG(context);
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'fail');

    await assertOTPElementsForBEPG(context);
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'pass');
  });
});
