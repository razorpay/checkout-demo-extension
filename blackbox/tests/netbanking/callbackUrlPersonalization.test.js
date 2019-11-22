const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPaymentMethodText,
  paymentMethodsSelection,
  submit,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('Netbanking Personalization tests', () => {
  test('perform netbaking transaction with Personalization and callback url', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 200,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888882');
    await verifyPaymentMethodText(
      context,
      'Netbanking',
      'Netbanking - HDFC Bank'
    );
    await paymentMethodsSelection(context);
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'HDFC',
    });
  });
});
