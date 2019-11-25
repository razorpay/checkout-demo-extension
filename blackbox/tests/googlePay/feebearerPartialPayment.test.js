const { makePreferences } = require('../../actions/preferences');
const { openCheckout } = require('../../actions/checkout');

const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleFeeBearer,
  handlePartialPayment,
  verifyPartialAmount,
  selectBankNameFromDropDown,
  selectUPIApplication,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Feebearer with partial GooglePay payment', () => {
  test('Perform GooglePay transaction with feebearer and partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
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
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApplication(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromDropDown('okhdfcbank');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
