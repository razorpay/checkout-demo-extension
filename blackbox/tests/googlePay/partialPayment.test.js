const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleUPIAccountValidation,
  selectBankNameFromDropDown,
  selectUPIApplication,
  handlePartialPayment,
  verifyPartialAmount,
  enterUPIAccount,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Partial GooglePay payment', () => {
  test('Perform GooglePay transaction with partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 10000,
      personalization: false,
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
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApplication(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromDropDown('okhdfcbank');
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
