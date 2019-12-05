//Not Implemented
const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsNetbanking,
  submit,
  failRequestwithErrorMessage,
  verifyErrorMessage,
  handlePartialPayment,
} = require('../../actions/common');

describe.skip('Netbanking tests', () => {
  test('perform netbanking transaction with partial payments', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888882');
    await handlePartialPayment(context, '100');
    await assertPaymentMethodsNetbanking(context);
    await submit(context);
    const expectedErrorMeassage = 'Payment failed';
    await failRequestwithErrorMessage(context, expectedErrorMeassage);
    await verifyErrorMessage(context, expectedErrorMeassage);
  });
});
