const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleCustomerCardStatusRequest,
  respondToPayLater,
  verifyPayLaterOTP,
  typeOTPandSubmit,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction with partial payment enabled', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 5000,
      personalization: false,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context, '0007');
    await handleCustomerCardStatusRequest(context);
    await verifyPayLaterOTP(context);
    await respondToPayLater(context);
  });
});
