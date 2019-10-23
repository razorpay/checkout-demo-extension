const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectBank,
  assertNetbankingPage,
  verifyHighDowntime,
  verifyLowDowntime,
  verifyTimeout,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      timeout: 10,
    };

    const preferences = makePreferences({
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
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await verifyHighDowntime(context, 'ICICI Bank');
    await selectBank(context, 'HDFC');
    await verifyLowDowntime(context, 'HDFC Bank');
    await verifyTimeout(context, 'netbanking');
  });
});
