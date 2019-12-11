const { openCheckoutWithNewHomeScreen } = require('../open');
const { makePreferences } = require('../../../actions/preferences');
const {
  selectPersonalizedCard,
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  retryTransaction,
  handleMockSuccessDialog,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe('Card tests', () => {
  test('perform card transaction with personalization', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
    };
    const preferences = makePreferences();
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Card',
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context, '8888888881');
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPersonalizedCard(context);
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await retryTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
