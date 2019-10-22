const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectWallet,
  assertWalletPage,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  handleCardValidationWithCallback,
  handleMockSuccessOrFailWithCallback,
} = require('../../actions/common');

describe.skip('Basic wallet payment', () => {
  test('Perform wallet transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'freecharge');
    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
    // await handleCardValidationWithCallback(context);
    // await handleMockSuccessOrFailWithCallback(context, 'pass');
  });
});
