const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  handleSaveVpaRequest,
  respondToUPIPaymentStatus,
  verifyLowDowntime,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  selectPaymentMethod,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData('Verify UPI downtime - Low', {
    loggedIn: true,
    anon: false,
    options: {
      amount: 200,
      personalization: false,
    },
    preferences: {
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
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await verifyLowDowntime(context, 'UPI', 'upi');
    await selectUPIMethod(context, 'new');
    await enterUPIAccount(context, 'saranshgupta1995@okaxis');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await handleSaveVpaRequest(context);
    await respondToUPIPaymentStatus(context);
  });
});
