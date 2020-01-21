const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectUPIMethod,
  submit,
  verifyOmnichannelPhoneNumber,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData('Perform Omnichannel transaction with callbackURL', {
    options: {
      amount: 60000,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    },
    preferences: {
      features: { google_pay_omnichannel: true },
    },
  })
)('Omnichannel tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'omnichannel');
    await verifyOmnichannelPhoneNumber(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
