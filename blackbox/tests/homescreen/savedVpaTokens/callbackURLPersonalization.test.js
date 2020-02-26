const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleUPIAccountValidation,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData(
    'Perform upi collect transaction with callbackURL and personalization enabled',
    {
      loggedIn: true,
      anon: false,
      options: {
        amount: 200,
        personalization: true,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
    }
  )
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    if (preferences.customer) {
      preferences.customer.contact = '+918888888881';
    }

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'upi');
    await selectPersonalizationPaymentMethod(context, 1);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
