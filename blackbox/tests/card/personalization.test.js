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
  respondToUPIPaymentStatus,
  paymentMethodsSelection,
} = require('../../actions/common');

describe.skip('Basic QR Scanner with Personalization', () => {
  test('Perform QR Scanner with Personalization transaction', async () => {
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
      method: 'Cards',
    });

    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPaymentMethodText(context, 'UPI', 'UPI - dsd@okhdfcbank');
    await paymentMethodsSelection(context);
    await submit(context);
    console.log('submit done');
    await respondToUPIAjax(context, '');
    console.log('respondToUPIAjax done');

    await respondToUPIPaymentStatus(context);
    console.log('respondToUPIAjax done');
  });
});
