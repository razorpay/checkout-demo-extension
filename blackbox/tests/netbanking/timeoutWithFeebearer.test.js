const { openCheckout } = require('../../checkout');
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
  handleValidationRequest,
  verifyTimeout,
  handleFeeBearer,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };

    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await submit(context);
    await handleFeeBearer(context, page);
    await handleValidationRequest(context, 'fail');
    await verifyTimeout(context, 'netbanking');
  });
});
