const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
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
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction', async () => {
    const options = {
      contact_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await delay(30000);
    // await assertPaymentMethods(context);
    // await selectPaymentMethod(context, 'netbanking');
    // await assertNetbankingPage(context);
    // await selectBank(context, 'SBIN');
    // await submit(context);
    // await passRequestNetbanking(context);
    // await handleMockSuccessDialog(context);
  });
});
