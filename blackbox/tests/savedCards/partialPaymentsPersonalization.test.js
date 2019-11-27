const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  handleCardValidation,
  handleMockSuccessDialog,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  selectPersonalizedCard,
  handlePartialPayment,
  verifyPartialAmount,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with personalization and partial payment enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: true,
      remember_customer: true,
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
    let context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8195959777');
    await handlePartialPayment(context, '100');
    await delay(30000);
    await selectPersonalizedCard(context);
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await verifyPartialAmount(context, '₹ 100');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
