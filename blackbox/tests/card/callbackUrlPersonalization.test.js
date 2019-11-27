const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  selectPersonalizedCard,
  submit,
  enterCardDetails,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction with personalization and callbackURL enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    let context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await selectPersonalizedCard(context);
    await enterCardDetails(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
