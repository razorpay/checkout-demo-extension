const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  verifyPersonalizationText,
  assertEditUserDetailsAndBack,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData(
    'Perform Wallet with Personalization transaction and Callback Url',
    {
      loggedIn: false,
      options: {
        amount: 60000,
        personalization: true,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
    }
  )
)('Wallet tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'wallet');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'wallet',
      wallet: 'freecharge',
    });
  });
});
