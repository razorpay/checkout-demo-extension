const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  submit,
  failRequestwithErrorMessage,
  verifyErrorMessage,
} = require('../../actions/common');

describe('Basic Netbanking with Personalization', () => {
  test('Perform Netbanking with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences();
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888882');
    await assertPaymentMethodsPersonalization(context);
    await submit(context);
    const expectedErrorMeassage = 'Payment failed';
    await failRequestwithErrorMessage(context, expectedErrorMeassage);
    await verifyErrorMessage(context, expectedErrorMeassage);
  });
});
