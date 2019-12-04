const { openCheckout } = require('../../actions/checkout');
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
      personalization: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Wallet',
      timeout: 15,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
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
