const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  submit,
  handleUPIAccountValidation,
  handlePartialPayment,
  verifyPartialAmount,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe.skip('Partial GooglePay payment', () => {
  test('Perform GooglePay transaction with partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
    };
    const preferences = makePreferences({
      order: {
        amount: 10000,
        amount_due: 10000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888881');
    await delay(1000);
    await assertPaymentMethodsPersonalization(context);
    await handlePartialPayment(context, '1');
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
