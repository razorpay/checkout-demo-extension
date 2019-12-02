const { makePreferences } = require('../../../actions/preferences');
const {
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  verifyErrorMessage,
  retryCardTransaction,
  handleMockSuccessDialog,
} = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe('Card tests', () => {
  test('perform card transaction with contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    // await verifyErrorMessage(context, 'The payment has already been processed');
    await retryCardTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
