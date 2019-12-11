const { getTestData } = require('../../../actions');
const {
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockSuccessDialog,
  verifyErrorMessage,
  retryTransaction,
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

describe.each(
  getTestData(
    'perform successful card transaction with contact and email optional',
    {
      loggedIn: false,
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        optional: ['contact', 'email'],
      },
    }
  )
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
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
    await retryTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
