const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  verifyPayoutInstruments,
  selectInstrument,
  submit,
} = require('../../actions/common');

describe('Payout tests', () => {
  test('verify payouts using existing Bank instrument', async () => {
    const options = {
      contact_id: 'cont_BXV5GAmaJEcGr1',
      payout: true,
      key: 'rzp_test_1DP5mmOlF5G5ag',
    };
    const preferences = makePreferences({
      contact: {
        id: 'cont_BXV5GAmaJEcGr1',
        name: 'Contact 1',
        fund_accounts: [
          {
            id: 'fa_DgYKg6fjnEPb72',
            account_type: 'vpa',
            vpa: {
              address: 'yvp@upi',
            },
          },
          {
            id: 'fa_DgY4tYmCBkEl2z',
            account_type: 'bank_account',
            bank_account: {
              ifsc: 'SBIN0007105',
              bank_name: 'State Bank of India',
              name: 'Mehul Kaushik',
              notes: [],
              account_number: 'XXXXXX1122',
            },
          },
        ],
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await verifyPayoutInstruments(context);
    await selectInstrument(context, 2);
    await submit(context);
  });
});
