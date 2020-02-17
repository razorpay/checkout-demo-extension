const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectUPIMethod,
  submit,
  respondToUPIAjax,
  verifyOmnichannelPhoneNumber,
  respondToUPIPaymentStatus,
  verifyPartialAmount,
  verifyLowDowntime,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData(
    'Verify Omnichannel downtime - Low with partial payments enabled',
    {
      options: {
        amount: 60000,
        personalization: false,
      },
      preferences: {
        features: { google_pay_omnichannel: true },
        order: {
          amount: 60000,
          amount_due: 60000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
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
    }
  )
)('Omnichannel tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await verifyLowDowntime(context, 'UPI');
    await selectUPIMethod(context, 'omnichannel');
    await verifyOmnichannelPhoneNumber(context);
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
