const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  respondToUPIPaymentStatus,
  respondToUPIAjax,
  handleUPIAccountValidation,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('GooglePay with Personalization  payment', () => {
  test('Perform GooglePay with Personalization transaction', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
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
    await fillUserDetails(context, '8888888885');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'UPI',
      'UPI - scbaala@okhdfcbank'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
