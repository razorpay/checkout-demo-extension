const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationText,
  submit,
  respondToUPIPaymentStatus,
  respondToUPIAjax,
  responseWithQRImage,
  validateQRImage,
  selectPersonalizationPaymentMethod,
  handleFeeBearer,
} = require('../../actions/common');

describe('QR Scanner with Personalization  payment', () => {
  test('Perform QR Scanner with Personalization and customer feebearer transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      personalization: true,
    };
    const preferences = makePreferences({ fee_bearer: true });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'QR',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationText(context, 'qr');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleFeeBearer(context);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
