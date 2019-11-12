const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyAutoSelectBankTPV,
  verifyTimeout,
} = require('../../actions/common');

describe('Third Party Verification test', () => {
  test('Perform Third Party Verification transaction with timeout enabled and contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 20000,
        currency: 'INR',
        account_unmber: '1234567891234567',
        bank: 'SBIN',
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await verifyTimeout(context, 'tpv');
  });
});
