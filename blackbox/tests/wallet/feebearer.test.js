const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const {
  handleFeeBearer,
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertWalletPage,
  selectWallet,
  submit,
  typeOTPandSubmit,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
} = require('../../actions/common');

describe('Wallet Transaction', () => {
  test('Perform wallet transaction with fee bearer', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'freecharge');
    await submit(context);

    await handleFeeBearer(context);

    await handleOtpVerification(context);
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'fail');
    await retryWalletTransaction(context);
    await submit(context);
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'pass');
  });
});
