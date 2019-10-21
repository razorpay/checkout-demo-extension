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
  handleCardValidationWithCallback,
  handleMockSuccessOrFailWithCallback,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform successful card transaction with callback URL', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);
    await handleCardValidationWithCallback(context);
    await handleMockSuccessOrFailWithCallback(context, 'pass');
  });
});
