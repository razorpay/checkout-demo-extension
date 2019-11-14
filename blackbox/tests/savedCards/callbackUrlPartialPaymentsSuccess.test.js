const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  handleCardValidationWithCallback,
  expectMockSuccessWithCallback,
  handlePartialPayment,
  verifyPartialAmount,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with callback URL and partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      remember_customer: true,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
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
    let context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await verifyPartialAmount(context, '₹ 100');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);
    await handleCardValidationWithCallback(context);
    await expectMockSuccessWithCallback(context);
  });
});
