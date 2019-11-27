const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsNetbanking,
  submit,
  failRequestwithErrorMessage,
  verifyErrorMessage,
  handleFeeBearer,
} = require('../../actions/common');

describe.skip('Basic Netbanking with Personalization', () => {
  test('Perform Netbanking with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888882');
    await assertPaymentMethodsNetbanking(context);
    await submit(context);
    await handleFeeBearer(context, page);

    await context.popup();

    const expectedErrorMeassage = 'Payment failed';
    await failRequestwithErrorMessage(context, expectedErrorMeassage);
    await verifyErrorMessage(context, expectedErrorMeassage);
  });
});
