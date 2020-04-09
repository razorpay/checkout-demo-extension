const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
} = require('../../actions/common');

describe('Basic upi payment', () => {
  test('Perform upi intent transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openSdkCheckout({
      page,
      options,
      preferences,
      apps: true,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await submit(context);
    await respondAndVerifyIntentRequest(context);
  });
});
