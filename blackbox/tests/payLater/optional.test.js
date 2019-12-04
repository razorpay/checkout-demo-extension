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
  handleWalletPopUp,
  passRequestPayLater,
} = require('../../actions/common');

describe('ePayLater Test', () => {
  test('perform ePayLater transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 5000,
      personalization: false,
      prefill: {
        email: 'scbaala@razorpay.com',
      },
    };
    const preferences = makePreferences({ optional: ['contact'] });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await passRequestPayLater(context);
    await handleWalletPopUp(context);
  });
});
