const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectBank,
  assertNetbankingPage,
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

describe.each(
  getTestData(
    'perform netbaking transaction with contact optional and Downtime',
    {
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        optional: ['contact'],
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
      },
    }
  )
)('Netbanking tests', ({ preferences, title, options }) => {
  test(title, async () => {
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
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'ICIC');
    await verifyLowDowntime(context, 'ICICI Bank');
    await selectBank(context, 'HDFC');
    await verifyLowDowntime(context, 'HDFC Bank');
  });
});
