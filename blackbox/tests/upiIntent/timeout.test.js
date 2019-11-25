const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  verifyTimeout,
  selectUPIApp,
} = require('../../actions/common');

describe.skip('Basic upi payment', () => {
  test('Perform upi intent transaction with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openSdkCheckout({
      page,
      options,
      preferences,
      apps: [{ package_name: 'in.org.npci.upiapp', app_name: 'BHIM' }],
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await verifyTimeout(context, 'upi');
  });
});
