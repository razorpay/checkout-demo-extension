const { makePreferences } = require('../../../actions/preferences');
const {
  submit,
  enterCardDetails,
  expectRedirectWithCallback,
} = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe('Card tests', () => {
  test('perform successful keyless card transaction with callback URL', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
