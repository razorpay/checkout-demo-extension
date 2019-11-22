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
  passRequestNetbanking,
  handleMockSuccessDialog,
  handleFeeBearer,
} = require('../../actions/common');

describe.skip('Netbanking tests', () => {
  test('perform netbanking transaction with partial payments and feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
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

    await handleFeeBearer(context, page);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
