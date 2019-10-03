const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  assertPaymentMethods,
  selectPaymentMethod,
  assertNetbankingPage,
  selectBank,
  submit,
  handleValidationRequest,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with contact and email optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, false, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);
    await handleValidationRequest(context, 'fail');
  });
});
