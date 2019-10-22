const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockSuccessOrFailDialog,
  verifyErrorMessage,
  retryCardTransaction,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform keyless card transaction with contact optional', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidation(context);
    await handleMockSuccessOrFailDialog(context, 'fail');
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryCardTransaction(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessOrFailDialog(context, 'pass');
  });
});
