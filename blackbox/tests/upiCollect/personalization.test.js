const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Basic upi payment', () => {
  test('Perform upi collect transaction with personalization enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    let context = await openCheckout({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationText(context, 'upi');
    await selectPersonalizationPaymentMethod(context, 1);
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});