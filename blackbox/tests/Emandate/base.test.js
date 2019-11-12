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
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction', async () => {
    const options = {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 0,
        currency: 'INR',
        method: 'emandate',
        bank: 'HDFC',
        payment_capture: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await delay(30000);
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await delay(30000);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
