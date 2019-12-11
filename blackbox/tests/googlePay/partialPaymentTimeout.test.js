const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectBankNameFromGooglePayDropDown,
  selectUPIMethod,
  handlePartialPayment,
  verifyPartialAmount,
  enterUPIAccount,
  verifyTimeout,
} = require('../../actions/common');

describe.skip('Partial Timeout GooglePay payment', () => {
  test('Perform GooglePay transaction with partial payments with timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 10000,
      personalization: false,
      timeout: 10,
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
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await verifyPartialAmount(context, '₹ 1');
    await verifyTimeout(context, 'upi');
  });
});