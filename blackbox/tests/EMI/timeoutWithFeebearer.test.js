const { openCheckout } = require('../../actions/checkout');
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
  handleFeeBearer,
} = require('../../actions/common');

describe.skip('EMI tests', () => {
  test('perform EMI transaction with timeout and feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await submit(context);
    await verifyEMIPlansWithoutOffers(context, '6');
    await selectEMIPlanWithoutOffer(context, '2');
    await submit(context);
    await handleFeeBearer(context);
    await verifyTimeout(context, 'emi');
  });
});
