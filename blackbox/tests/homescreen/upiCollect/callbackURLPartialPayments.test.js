const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  verifyPartialAmount,
  expectRedirectWithCallback,
  submit,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData(
    'Perform upi collect transaction with callbackURL and Partial Payments enabled',
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
        order: {
          amount: 20000,
          amount_due: 20000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
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
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'new');
    await enterUPIAccount(context, 'saranshgupta1995@okaxis');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
