const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectUPIIDFromDropDown,
  submit,
  respondToUPIAjax,
  handleFeeBearer,
  enterUPIAccount,
  selectUPIApp,
  selectPaymentMethod,
  respondToQRAjax,
  validateQRImage,
} = require('../../actions/common');

describe('Feebearer Keyless QR Code Payment', () => {
  test('Perform QR Code transaction with keyless feebearer enabled', async () => {
    const options = {
      order_id: 'rzp_test_BlUXikp98tvz4X',
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
