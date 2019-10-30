const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  enterCardDetails,
  submit,
  selectEMIPlanWithoutOffer,
  verifyEMIPlansWithoutOffers,
  handleEMIValidation,
  handleMockSuccessDialog,
  handlePartialPayment,
  verifyPartialAmount,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 300000,
        amount_due: 300000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await handlePartialPayment(context, '3000');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await submit(context);
    await verifyEMIPlansWithoutOffers(context, '6');
    await selectEMIPlanWithoutOffer(context, '2');
    await verifyPartialAmount(context, '₹ 3,000');
    await submit(context);
    await handleEMIValidation(context);
    await handleMockSuccessDialog(context);
  });
});
