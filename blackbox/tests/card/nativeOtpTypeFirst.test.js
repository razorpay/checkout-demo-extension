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
} = require('../../actions/common');

describe('Card tests', () => {
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
});
