const { makePreferences } = require('../../actions/preferences');
const { openCheckout } = require('../../actions/checkout');

const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectUPIApp,
  respondToUPIPaymentStatus,
  respondToUPIAjax,
} = require('../../actions/common');

describe.skip('Basic QR Code payment', () => {
  test('Perform QR Code transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
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
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
