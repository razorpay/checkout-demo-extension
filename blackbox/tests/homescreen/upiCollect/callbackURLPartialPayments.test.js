const { makePreferences } = require('../../../actions/preferences');
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

describe('Basic upi payment', () => {
  test('Perform upi collect transaction with callbackURL and Partial Payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
      order: {
        amount: 20000,
        amount_due: 20000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
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
    await selectUPIMethod(context, 'BHIM');
    await enterUPIAccount(context, 'BHIM');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
