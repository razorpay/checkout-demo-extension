const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  respondToUPIAjax,
  responseWithQRImage,
  validateQRImage,
  handleFeeBearer,
  verifyMethodWarned,
  selectUPIApp,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('QR Code Downtime payment', () => {
  test('Verify QR Code Downtimepayment- Low with customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
      amount: 60000,
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
            severity: 'low',
            instrument: [],
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
    await selectPaymentMethod(context, 'upi');
    await verifyMethodWarned(context, 'UPI', 'upi');
    await selectUPIApp(context, '1');
    await handleFeeBearer(context);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
