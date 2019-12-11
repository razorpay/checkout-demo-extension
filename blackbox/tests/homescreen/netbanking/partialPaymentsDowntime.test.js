const { makePreferences } = require('../../../actions/preferences');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  assertNetbankingPage,
  selectBank,
  verifyLowDowntime,
} = require('../../../actions/common');

const {
  handlePartialPayment,
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe('Netbanking tests', () => {
  test('perform netbanking transaction with partial payments and downtime', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
      payment_downtime: {
        entity: 'collection',
        count: 2,
        items: [
          {
            id: 'down_DEW7D9S10PEsl1',
            entity: 'payment.downtime',
            method: 'netbanking',
            begin: 1567686386,
            end: null,
            status: 'started',
            scheduled: false,
            severity: 'high',
            instrument: {
              bank: 'ICIC',
            },
            created_at: 1567686387,
            updated_at: 1567686387,
          },
          {
            id: 'down_DEW7D9S10PEsl2',
            entity: 'payment.downtime',
            method: 'netbanking',
            begin: 1567686386,
            end: null,
            status: 'started',
            scheduled: false,
            severity: 'low',
            instrument: {
              bank: 'HDFC',
            },
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
    });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'ICIC');
    await verifyLowDowntime(context, 'ICICI Bank');
    await selectBank(context, 'HDFC');
    await verifyLowDowntime(context, 'HDFC Bank');
  });
});
