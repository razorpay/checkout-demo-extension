const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleCardValidation,
  handleMockSuccessDialog,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  handlePartialPayment,
  verifyPartialAmount,
  handleFeeBearer,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with partial payments and customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      remember_customer: true,
    };
    const preferences = makePreferences({
      fee_bearer: true,
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
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await verifyPartialAmount(context, '₹ 100');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);
    await handleFeeBearer(context);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
