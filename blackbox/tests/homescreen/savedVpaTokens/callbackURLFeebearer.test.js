const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  expectRedirectWithCallback,
  handleFeeBearer,
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
  getTestData(
    'Perform upi collect transaction with callbackURL and customer feebearer enabled',
    {
      loggedIn: true,
      anon: false,
      options: {
        amount: 200,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
        fee_bearer: true,
      },
    }
  )
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    // await assertBasicDetailsScreen(context);
    // await fillUserDetails(context);
    // await proceed(context);
    // await assertUserDetails(context);
    // await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'token');
    await submit(context);
    await handleFeeBearer(context);
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
