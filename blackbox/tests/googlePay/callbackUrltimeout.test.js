const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  verifyTimeout,
  selectUPIMethod,
  selectBankNameFromGooglePayDropDown,
  enterUPIAccount,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Perform GooglePay transaction with callbackurl and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
      amount: 200,
      personalization: false,
      timeout: 10,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
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
    await verifyTimeout(context, 'upi');
  });
});
