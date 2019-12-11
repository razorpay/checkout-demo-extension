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
  verifyTimeout,
} = require('../../actions/common');

describe.skip('Card tests', () => {
  test('perform card transaction with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryTransaction(context);
    await verifyTimeout(context, 'card');
  });
});
