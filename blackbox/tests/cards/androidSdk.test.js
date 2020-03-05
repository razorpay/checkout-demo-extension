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
  retryTransaction,
  handleMockSuccessDialog,
} = require('../../actions/common');

const querystring = require('querystring');

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
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);

    // TODO make this versatile
    const req = await context.expectRequest();
    expect(req.raw.isNavigationRequest()).toBe(true);
    expect(req.method).toBe('POST');
    expect(querystring.parse(req.body)).toMatchObject({ method: 'card' });
  });
});
