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
  retryTransaction,
  handlePartialPayment,
  verifyPartialAmount,
  verifyTimeout,
} = require('../../actions/common');

describe.skip('Card tests', () => {
  test('perform card transaction with partial payment and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({
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
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryTransaction(context);
    await verifyTimeout(context, 'card');
  });
});
