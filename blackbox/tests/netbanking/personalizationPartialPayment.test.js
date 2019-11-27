//Not Implemented
const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  selectPersonalizationPaymentMethod,
  verifyPartialAmount,
  handlePartialPayment,
  passRequestNetbanking,
  handleMockSuccessDialog,
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
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888885');
    await handlePartialPayment(context, '100');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'Netbanking',
      'Netbanking - HDFC Bank'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
