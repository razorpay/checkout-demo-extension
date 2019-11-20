const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyAutoSelectBankTPV,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  handleFeeBearer,
  handlePartialPayment,
  verifyPartialAmount,
} = require('../../actions/common');
describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with customer feebearer and Partial Payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 20000,
        currency: 'INR',
        account_number: '1234567891234567',
        bank: 'SBIN',
        amount_due: 20000,
        amount_paid: 0,
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await handlePartialPayment(context, '100');
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleFeeBearer(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
