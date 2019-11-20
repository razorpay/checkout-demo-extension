const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethodsPersonalization,
  selectPaymentMethod,
  verifyTimeout,
  selectUPIApplication,
  enterUPIAccount,
  selectUPIIDFromDropDown,
} = require('../../actions/common');

describe('Timeout GooglePay payment', () => {
  test('Perform GooglePay transaction with Personalization and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      timeout: 10,
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
    await verifyTimeout(context, 'upi');
  });
});
