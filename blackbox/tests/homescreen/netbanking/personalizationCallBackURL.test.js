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
    'Perform Netbanking with Personalization and Callback URL transaction',
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
)('Netbanking tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'netbanking');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'HDFC',
    });
  });
});
