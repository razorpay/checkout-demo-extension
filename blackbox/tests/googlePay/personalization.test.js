const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPaymentMethodText,
  submit,
  respondToUPIAjax,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
  paymentMethodsSelection,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Perform GooglePay transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPaymentMethodText(context, 'UPI', 'UPI - dsd@okhdfcbank');
    await paymentMethodsSelection(context);
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
