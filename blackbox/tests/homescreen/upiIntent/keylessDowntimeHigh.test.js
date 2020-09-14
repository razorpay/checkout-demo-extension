const { makePreferences } = require('../../../actions/preferences');
const { openSdkCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyMethodDisabled,
  verifyMethodWarned,
} = require('../actions');

describe('Basic upi payment', () => {
  test('Verify keyless UPI intent downtime - High', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
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
            severity: 'high',
            instrument: [],
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
      upiApps: true,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
  });
});
