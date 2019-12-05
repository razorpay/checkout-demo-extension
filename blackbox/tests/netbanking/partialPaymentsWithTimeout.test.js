const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertNetbankingPage,
  selectBank,
  submit,
  handlePartialPayment,
  verifyPartialAmount,
  failRequestwithErrorMessage,
  verifyErrorMessage,
  verifyTimeout,
} = require('../../actions/common');

describe.skip('Netbanking tests', () => {
  test('perform netbanking transaction with partial payments and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
      timeout: 10,
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
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);

    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);

    const expectedErrorMeassage = 'Payment failed';
    await failRequestwithErrorMessage(context, expectedErrorMeassage);
    await verifyErrorMessage(context, expectedErrorMeassage);
    await verifyTimeout(context, 'netbanking');
  });
});
