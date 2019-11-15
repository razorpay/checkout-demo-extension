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
  handleMockFailureDialog,
  verifyErrorMessage,
  retryCardTransaction,
  verifyPartialAmount,
  handlePartialPayment,
  handleFeeBearer,
  handleMockSuccessDialog,
} = require('../../actions/common');

describe.skip('Card tests', () => {
  test('perform card transaction with partial payments and feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 20000,
        amount_due: 20000,
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
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleFeeBearer(context, page);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryCardTransaction(context);
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleFeeBearer(context, page);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
