const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay, visible } = require('../../util');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectBank,
  assertNetbankingPage,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  returnVirtualAccounts,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction', async () => {
    const options = {
      order_id: 'order_DhheFqhhT2RMur',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'bank_transfer');
    await returnVirtualAccounts(context);
    // await delay(30000);
    // await assertNetbankingPage(context);
    // await selectBank(context, 'SBIN');
    // await submit(context);
    // await passRequestNetbanking(context);
    // await handleMockSuccessDialog(context);
  });
});
