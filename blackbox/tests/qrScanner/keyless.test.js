const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  respondToUPIAjax,
  selectPaymentMethod,
  respondToUPIPaymentStatus,
  validateQRImage,
  responseWithQRImage,
  selectUPIApp,
} = require('../../actions/common');

describe('Feebearer Keyless QR Code Payment', () => {
  test('Perform QR Code transaction with keyless', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences();
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
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
