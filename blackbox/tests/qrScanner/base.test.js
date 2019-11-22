const { makePreferences } = require('../../actions/preferences');
const { openCheckout } = require('../../actions/checkout');

const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectUPIApp,
  validateQRImage,
  respondToQRAjax,
} = require('../../actions/common');

describe('Basic QR Code payment', () => {
  test('Perform QR Code transaction', async () => {
    const options = {
      key: 'rzp_live_ILgsfZCZoFIKMb',
      amount: 20000,
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
    await respondToQRAjax(context, '');
    await validateQRImage(context);
  });
});
