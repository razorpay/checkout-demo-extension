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
} = require('../../actions/common');
describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with customer feebearer enabled', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
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
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await submit(context);
    await handleFeeBearer(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
