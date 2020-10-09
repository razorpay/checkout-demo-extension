const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Verify UPI downtime - Low with personalization enabled', {
    loggedIn: true,
    anon: false,
    options: {
      amount: 200,
      personalization: true,
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
            instrument: { vpa_handle: 'ALL' },
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
    if (preferences.customer) {
      preferences.customer.contact = '+918888888881';
    }

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'upi');
    await selectPersonalizationPaymentMethod(context, 1);
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
