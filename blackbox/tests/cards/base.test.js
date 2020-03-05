const {
  makePreferences,
  makeOptions,
  openCheckout,
  makePreferencesLogged,
  getTestData,
} = require('../../actions');

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
  handleMockSuccessDialog,
} = require('../../actions/common');

describe.each(getTestData('perform card transaction'))(
  'Card tests',
  ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckout({ page, options, preferences });
      await assertHomePage(context);
      await fillUserDetails(context);

      await assertPaymentMethods(context);
      await selectPaymentMethod(context, 'card');
      await enterCardDetails(context);
      await submit(context);
      await handleCardValidation(context);
      await handleMockFailureDialog(context);
      await verifyErrorMessage(
        context,
        'The payment has already been processed'
      );
      await retryTransaction(context);
      await submit(context);

      await handleCardValidation(context);
      await handleMockSuccessDialog(context);
    });
  }
);
