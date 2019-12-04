const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationPaymentMethodsText,
  submit,
  expectRedirectWithCallback,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Wallet with Personalization  payment', () => {
  test('Perform Wallet with Personalization transaction and Callback Url', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
      personalization: true,
    };
    const preferences = makePreferences();
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'Wallet',
      'Wallet - Freecharge'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'wallet',
      wallet: 'freecharge',
    });
  });
});
