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
  handlePartialPayment,
  verifyPartialAmount,
  handleFeeBearer,
} = require('../../actions/common');

describe.skip('Wallet tests', () => {
  test('Wallet payment with partial payment and feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 60000,
        amount_due: 60000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'freecharge');
    await submit(context);
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await verifyPartialAmount(context, '₹ 100');
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