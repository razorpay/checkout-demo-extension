const { delay } = require('../../util');
const { makePreferences } = require('../../actions/preferences');
const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { callbackPage } = require('../../actions/callback');
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
  retryCardTransaction,
  handleMockSuccessDialog,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      redirect: true,
    };
    const preferences = makePreferences();

    const context = await openSdkCheckout({ page, options, preferences });

    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);

    const errorMessage = 'payment failed because this is a test';
    await callbackPage(context, { error: { description: errorMessage } });

    await delay(1000);
    // TODO put error message check here
    // expect(page.$('fd-t'));
    await page.click('#fd-hide');

    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);

    const successResult = { razorpay_payment_id: 'pay_Successful' };
    await callbackPage(context, successResult);
    const result = await context.getResult();
    expect(result).toMatchObject(successResult);
  });
});
