const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  handleFeeBearer,
  selectUPIApp,
  validateQRImage,
  responseToQRImage,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Basic QR Code Payment', () => {
  test('Perform QR Code transaction with feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ fee_bearer: true });
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
    await handleFeeBearer(context);
    await respondToUPIAjax(context, '', { method: 'intent' });
    await responseToQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
