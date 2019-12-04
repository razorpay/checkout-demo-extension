const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  respondToUPIPaymentStatus,
  respondToUPIAjax,
  responseWithQRImage,
  validateQRImage,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('QR Scanner with Personalization  payment', () => {
  test('Perform QR Scanner with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      personalization: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'QR',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationPaymentMethodsText(context, 'QR', 'UPI QR');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
