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

describe('Basic Netbanking with Personalization', () => {
  test('Perform Netbanking with Personalization and Callback URL transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
      personalization: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationPaymentMethodsText(
      context,
      'Netbanking',
      'Netbanking - HDFC Bank'
    );
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'HDFC',
    });
  });
});
