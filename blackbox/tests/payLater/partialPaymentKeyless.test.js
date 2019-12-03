const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  handlePartialPayment,
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleCustomerCardStatusRequest,
  respondToPayLater,
  verifyPayLaterOTP,
  typeOTPandSubmit,
  verifyPartialAmount,
} = require('../../actions/common');

describe('Perform ePayLater Test', () => {
  test('perform ePayLater transaction with partial payment enabled and keyless', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await verifyPartialAmount(context, '₹ 100');
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
