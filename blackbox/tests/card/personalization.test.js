const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  selectPersonalizedCard,
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  retryTransaction,
  handleMockSuccessDialog,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction with personalization', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
    };
    const preferences = makePreferences();
    let context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await selectPersonalizedCard(context);
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    // await verifyErrorMessage(context, 'The payment has already been processed');
    await retryTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
