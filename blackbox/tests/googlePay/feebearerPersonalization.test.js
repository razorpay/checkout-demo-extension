const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  selectUPIIDFromDropDown,
  submit,
  respondToUPIAjax,
  handleFeeBearer,
  enterUPIAccount,
  selectUPIApplication,
  selectPaymentMethod,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe.skip('Feebearer and Personalization GooglePay Payment', () => {
  test('Perform GooglePay transaction with feebearer and Personalization enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
    };
    const preferences = makePreferences({ fee_bearer: true });
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
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
