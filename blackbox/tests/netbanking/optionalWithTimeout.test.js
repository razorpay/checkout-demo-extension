const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectBank,
  assertNetbankingPage,
  submit,
  handleValidationRequest,
  verifyTimeout,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);

    await handleValidationRequest(context, 'fail');
    await verifyTimeout(context, 'netbanking');
  });
});
