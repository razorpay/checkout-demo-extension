const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertNetbankingPage,
  selectBank,
  handlePartialPayment,
  verifyHighDowntime,
  verifyLowDowntime,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbanking transaction with partial payments', async () => {
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
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);

    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'ICIC');
    await verifyLowDowntime(context, 'ICICI Bank');
    await selectBank(context, 'HDFC');
    await verifyLowDowntime(context, 'HDFC Bank');
  });
});
