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
  handleBankRequest,
  typeOTPandSubmit,
  verifyOTP,
  resendOTP,
  goToBankPage,
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

  test('perform card transaction with native otp flow - type first response', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openSdkCheckout({ page, options, preferences });
    await assertHomePage(context);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidationForNativeOTP(context);

    const result = JSON.parse(await context.getResult());
    expect(result).toEqual({
      url: 'https://api.razorpay.com/bank',
      method: 'get',
      content: [],
    });
  });

  test('perform card transaction with native otp flow - go to bank', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMbnativeotp',
      amount: 200,
      personalization: false,
      callback_url: 'https://google.com',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openSdkCheckout({ page, options, preferences });
    await assertHomePage(context);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidationForNativeOTP(context, { coproto: 'otp' });
    await goToBankPage(context);

    const result = JSON.parse(await context.getResult());
    expect(result).toEqual({
      url: 'http://localhost:9008',
      method: 'post',
      content: null,
    });
  });

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
