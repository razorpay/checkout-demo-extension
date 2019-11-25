const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
} = require('../../actions/common');

describe('Bank transfer tests', () => {
  test('perform bank transfer transaction', async () => {
    const options = {
      order_id: 'order_DhheFqhhT2RMur',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences();
    preferences.methods.bank_transfer = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'bank_transfer');
    await returnVirtualAccounts(context);
    await verifyNeftDetails(context);
    await verifyRoundOffAlertMessage(context);
  });
});
