const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyAutoSelectBankTPV,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
} = require('../../actions/common');
describe('Third Party Verification test', () => {
  test('Perform Keyless Third Party Verification transaction with contact optional', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 20000,
        currency: 'INR',
        account_number: '1234567891234567',
        bank: 'SBIN',
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});