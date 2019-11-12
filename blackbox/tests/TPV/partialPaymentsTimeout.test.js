const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyAutoSelectBankTPV,
  handlePartialPayment,
  verifyPartialAmount,
  verifyTimeout,
} = require('../../actions/common');
describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with Partial Payments and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        currency: 'INR',
        account_unmber: '1234567891234567',
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
    await verifyTimeout(context, 'tpv');
  });
});
