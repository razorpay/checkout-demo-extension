const { makePreferences } = require('../../../actions/preferences');
const {
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockSuccessDialog,
  verifyErrorMessage,
  retryCardTransaction,
  handleMockFailureDialog,
} = require('../../../actions/common');

// New imports
const {
  assertMethodsScreen,
  assertPaymentMethods,
  selectPaymentMethod,
  assertMissingDetails,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe('Card tests', () => {
  test('perform card transaction with contact and email optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Both are optional, we should land on the methods screen
    await assertMethodsScreen(context);
    await assertMissingDetails(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryCardTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
