const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  verifyTimeout,
  selectUPIApplication,
  enterUPIAccount,
  selectUPIIDFromDropDown,
} = require('../../actions/common');

describe.skip('Timeout with feebearer GooglePay payment', () => {
  test('Perform GooglePay transaction with feebearer and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences({ fee_bearer: true });
    preferences.methods.upi = true;
    const context = await openSdkCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApplication(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectUPIIDFromDropDown(context, 'okhdfcbank', 'gpay_bank');
    await verifyTimeout(context, 'upi');
  });
});
