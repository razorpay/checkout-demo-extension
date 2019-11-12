const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  respondAndVerifyIntentRequest,
  handleFeeBearer,
  selectUPIApp,
} = require('../../actions/common');

describe('Basic GooglePay Payment', () => {
  test('Perform GooglePay transaction with feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
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
    await submit(context);
    await handleFeeBearer(context, page);
    await respondAndVerifyIntentRequest(context);
  });
});
