const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyHighDowntime,
} = require('../actions');

describe.each(
  getTestData('Verify UPI downtime - High with contact optional', {
    loggedIn: true,
    anon: false,
    options: {
      amount: 200,
      personalization: false,
    },
    preferences: {
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
            severity: 'high',
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
    },
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    // await assertBasicDetailsScreen(context);
    // await fillUserDetails(context);
    // await proceed(context);
    // await assertUserDetails(context);
    // await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyHighDowntime(
      context,
      'upi',
      'UPI is facing temporary issues right now.'
    );
  });
});
