const { openCheckout } = require('../../actions/checkout');
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
      personalization: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'UPI',
      'UPI - dsd@okhdfcbank'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
