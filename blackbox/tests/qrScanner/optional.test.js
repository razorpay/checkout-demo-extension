const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectUPIApp,
  selectPaymentMethod,
  respondToQRAjax,
  validateQRImage,
} = require('../../actions/common');

describe(' Perform QRCode Payment', () => {
  test('Perform QRCode transaction with optional contact', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact'] });
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
    await respondToQRAjax(context, '');
    await validateQRImage(context);
  });
});
