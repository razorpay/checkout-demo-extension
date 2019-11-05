const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  enterCardDetails,
  submit,
  selectEMIPlanWithoutOffer,
  verifyEMIPlansWithoutOffers,
  verifyTimeout,
} = require('../../actions/common');

describe('EMI tests', () => {
  test('perform keyless EMI transaction with timeout enabled', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await submit(context);
    await verifyEMIPlansWithoutOffers(context, '6');
    await selectEMIPlanWithoutOffer(context, '2');
    await verifyTimeout(context, 'emi');
  });
});
