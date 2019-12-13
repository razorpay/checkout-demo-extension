const { makePreferences } = require('../../../actions/preferences');
const { openSdkCheckoutWithNewHomeScreen } = require('../open');

const {
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
  verifyLowDowntime,
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

describe('Basic upi payment', () => {
  test('Verify UPI intent downtime - Low with contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      payment_downtime: {
        entity: 'collection',
        count: 1,
        items: [
          {
            id: 'down_DEW7D9S10PEsl1',
            entity: 'payment.downtime',
            method: 'upi',
            begin: 1567686386,
            end: null,
            status: 'started',
            scheduled: false,
            severity: 'low',
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
    });
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
    await verifyLowDowntime(context, 'UPI');
    await selectUPIApp(context, '1');
    await submit(context);
    await respondAndVerifyIntentRequest(context);
  });
});
