const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectFromDropDown,
  submit,
  respondToUPIAjax,
  enterUPIAccount,
  selectGooglePay,
  selectPaymentMethod,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Feebearer GooglePay Payment', () => {
  test('Perform GooglePay transaction with optional contact', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    //await delay(1000);
    await selectGooglePay(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectFromDropDown(context, 'okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
