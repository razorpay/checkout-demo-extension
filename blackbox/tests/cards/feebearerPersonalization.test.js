const { openCheckout } = require('../../actions/checkout');
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
  handleFeeBearer,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction with personalization and customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({
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
    await handleFeeBearer(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await retryTransaction(context);
    await submit(context);
    await handleFeeBearer(context);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
