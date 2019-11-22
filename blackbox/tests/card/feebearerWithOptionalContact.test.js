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
  handleMockSuccessDialog,
  verifyErrorMessage,
  retryCardTransaction,
  handleFeeBearer,
  handleMockFailureDialog,
} = require('../../actions/common');

describe.skip('Card tests', () => {
  test('perform card transaction with customer feebearer enabled and contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      optional: ['contact'],
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);
    await handleFeeBearer(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    // await verifyErrorMessage(context, 'The payment has already been processed');
    await retryCardTransaction(context);
    await submit(context);
    await handleFeeBearer(context);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
