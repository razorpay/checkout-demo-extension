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
  expectRedirectWithCallback,
  verifyPayLaterOTP,
  typeOTPandSubmit,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction with callback enabled and partial payment', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 5000,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
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
    await verifyPayLaterOTP(context);
    await expectRedirectWithCallback(context, { method: 'paylater' });
  });
});
