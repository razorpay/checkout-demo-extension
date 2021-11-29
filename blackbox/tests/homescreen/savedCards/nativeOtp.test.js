const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  verifyOTP,
  resendOTP,
  handleCardValidationForNativeOTP,
  respondCurrencies,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

const { makePreferences } = require('../../../actions/preferences');

describe('Saved Card tests', () => {
  test('Saved Card tests', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 200,
      remember_customer: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context, { nativeOtp: true });
    await selectSavedCardAndTypeCvv(context);
    /**
     * This test case is using international card. It is expected to make `/flows` api call for saved card.
     */
    await respondCurrencies(context);
    await submit(context);
    await handleCardValidationForNativeOTP(context, { coproto: 'otp' });
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'fail');
    await resendOTP(context);
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'pass');
  });
});
