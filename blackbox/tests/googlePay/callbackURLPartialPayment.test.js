const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  expectRedirectWithCallback,
  selectBankNameFromGooglePayDropDown,
  verifyPartialAmount,
  handlePartialPayment,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Perform GooglePay collect transaction with callbackURL and Partial Payment', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 10000,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
      order: {
        amount: 10000,
        amount_due: 10000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfc');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
