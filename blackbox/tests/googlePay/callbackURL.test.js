const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  expectRedirectWithCallback,
  selectBankNameFromGooglePayDropDown,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Perform GooglePay collect transaction with callbackURL', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfc');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
