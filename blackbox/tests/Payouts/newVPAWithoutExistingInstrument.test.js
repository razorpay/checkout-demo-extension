const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  verifyPayoutInstruments,
  addInstrument,
  selectUPIMethod,
  submit,
  enterUPIAccount,
  respondToFundAccountsRequest,
  handleUPIAccountValidation,
} = require('../../actions/common');

describe('Payout tests', () => {
  test('Verify payouts by adding new VPA Instrument while other Instruments do not exist', async () => {
    const options = {
      contact_id: 'cont_BXV5GAmaJEcGr1',
      payout: true,
      key: 'rzp_test_1DP5mmOlF5G5ag',
    };
    const preferences = makePreferences({
      contact: {
        id: 'cont_BXV5GAmaJEcGr1',
        name: 'Contact 1',
        fund_accounts: [],
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    // await verifyPayoutInstruments(context);
    await addInstrument(context, 'VPA');
    await selectUPIMethod(context, 'BHIM');
    await enterUPIAccount(context, 'BHIM');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await respondToFundAccountsRequest(context, 'BHIM');
  });
});
