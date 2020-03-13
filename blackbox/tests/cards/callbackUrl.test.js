const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { getTestData } = require('../../actions');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  enterCardDetails,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe.each(
  getTestData('perform failed card transaction with callback URL', {
    options: {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    },
  })
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await enterCardDetails(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
