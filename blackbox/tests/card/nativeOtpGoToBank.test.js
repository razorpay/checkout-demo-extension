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
  goToBankPage,
} = require('../../actions/common');

describe('Card tests', () => {
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

    const request = await context.expectRequest();
    expect(request.url).toEqual('http://localhost:9008/');
    expect(request.method.toLowerCase()).toEqual('post');
    await context.respondHTML('');
  });
});
