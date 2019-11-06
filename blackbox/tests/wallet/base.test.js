const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectWallet,
  assertWalletPage,
  submit,
  typeOTPandSubmit,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
} = require('../../actions/common');

describe('Basic wallet payment', () => {
  test('Perform wallet transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
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

    await handleValidationRequest(context, 'fail');
    await retryWalletTransaction(context);

    await submit(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'pass');
  });
});
