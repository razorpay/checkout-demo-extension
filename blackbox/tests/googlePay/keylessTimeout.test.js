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

describe.skip('Basic GooglePay payment', () => {
  test('Perform GooglePay transaction with timeout enabled', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
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
      apps: [
        {
          package_name: 'com.google.android.apps.nbu.paisa.user',
          app_name: 'Google Pay (Tez)',
        },
      ],
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await verifyTimeout(context, 'upi');
  });
});
