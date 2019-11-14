const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockSuccessDialog,
  typeOTPandSubmit,
  verifyOTP,
  resendOTP,
  goToBankPage,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction with native otp flow', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 200,
      personalization: false,
      callback_url: 'https://google.com',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidation(context, { coproto: 'otp' });
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'fail');
    await resendOTP(context);
    await typeOTPandSubmit(context);
    await verifyOTP(context, 'pass');
  });

  test('perform card transaction with native otp flow - type first response', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidation(context);
    const req = await context.expectRequest();
    expect(req.url).toContain('localhost:9008');
  });

  test('perform card transaction with native otp flow - go to bank', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 200,
      personalization: false,
      callback_url: 'https://google.com',
      redirect: true,
    };
    const preferences = makePreferences({ mode: 'live' });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidation(context, { coproto: 'otp' });
    await goToBankPage(context);
    await handleMockSuccessDialog(context);
  });

  test('avoid native otp flow in non-redirect mode', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context, { nativeOtp: true });
    await submit(context);
    await handleCardValidation(context, { urlShouldContain: 'create/ajax' });
    await handleMockSuccessDialog(context);
  });
});
