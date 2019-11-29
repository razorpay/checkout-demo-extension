const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  selectPersonalizationPaymentMethod,
  retryWalletTransaction,
  selectWallet,
  verifyTimeout,
  typeOTP,
  assertWalletPage,
} = require('../../actions/common');

describe('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction and Timeout', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      timeout: 15,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Wallet',
      timeout: 15,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888885');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'Wallet',
      'Wallet - Freecharge'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);

    await handleOtpVerification(context);
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'fail');
    await retryWalletTransaction(context);
    await delay(200);
    await assertWalletPage(context);

    await selectWallet(context, 'freecharge');

    await submit(context);
    await handleOtpVerification(context);
    await typeOTP(context);
    await verifyTimeout(context, 'wallet');
  });
});
