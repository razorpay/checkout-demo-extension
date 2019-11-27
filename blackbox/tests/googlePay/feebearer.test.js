const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectBankNameFromGooglePayDropDown,
  submit,
  respondToUPIAjax,
  handleFeeBearer,
  enterUPIAccount,
  selectUPIMethod,
  selectPaymentMethod,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Feebearer GooglePay Payment', () => {
  test('Perform GooglePay transaction with feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
