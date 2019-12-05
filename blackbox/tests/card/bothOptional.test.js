const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { getTestData } = require('../../actions');
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
  retryTransaction,
  handleMockFailureDialog,
} = require('../../actions/common');

describe.each(
  getTestData('perform card transaction with contact and email optional', {
    preferences: { optional: ['contact', 'email'] },
  })
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, false, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
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
