const { makePreferences } = require('../../../actions/preferences');
const { openSdkCheckoutWithNewHomeScreen } = require('../open');

const {
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe('UPI Intent tests', () => {
  test('perform UPI Intent transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openSdkCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      apps: [{ package_name: 'in.org.npci.upiapp', app_name: 'BHIM' }],
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await submit(context);
    await respondAndVerifyIntentRequest(context);
  });
});
