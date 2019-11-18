const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  submit,
  respondToUPIAjax,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
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
    await fillUserDetails(context, true, '8888888881');
    await assertPaymentMethodsPersonalization(context);
    await delay(1000);
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
