const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  verifyTimeout,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction with feebearer payment enabled and timeout', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyTimeout(context, 'paylater');
  });
});
