const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleValidationRequest,
  verifyTimeout,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction with timeout', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 5000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await handleValidationRequest(context, 'fail');
    await verifyTimeout(context, 'paylater');
  });
});
