const { openCheckoutWithNewHomeScreen } = require('../open');
const { getTestData } = require('../../../actions');
const {
  selectPersonalizedCard,
  submit,
  enterCardDetails,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData(
    'perform successful card transaction with callback URL and Personalization enabled',
    {
      loggedIn: false,
      options: {
        amount: 200,
        personalization: true,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
    }
  )
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Card',
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context, '8888888881');
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPersonalizedCard(context);
    await enterCardDetails(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
