const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  handleFeeBearer,
  selectUPIApp,
  respondToQRAjax,
  validateQRImage,
  respondToQRPaymentStatus,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Basic QR Code Payment', () => {
  test('Perform QR Code transaction with feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
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
    await handleFeeBearer(context, page);
    await respondToQRAjax(context, '');
    await validateQRImage(context);
  });
});
