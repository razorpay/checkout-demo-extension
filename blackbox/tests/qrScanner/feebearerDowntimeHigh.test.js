const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
} = require('../../actions/common');

describe('QRCode Downtimepayment payment', () => {
  test('Verify QRCode Downtimepayment- High with customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
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
            instrument: { vpa_handle: 'ALL' },
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
  });
});
