const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  responseWithQRImage,
  validateQRImage,
  handleFeeBearer,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectUPIApp,
  selectPaymentMethod,
  assertPaymentMethods,
} = require('../../actions/common');

describe('Feebearer with optional contact QR Code Payment', () => {
  test('Perform QR Code transaction with feebearer enabled and optional contact', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      optional: ['contact'],
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
