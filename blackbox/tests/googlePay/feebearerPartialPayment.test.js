const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const { openCheckout } = require('../../actions/checkout');

const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  respondAndVerifyIntentRequest,
  handleFeeBearer,
  selectUPIApp,
  handlePartialPayment,
  verifyPartialAmount,
  selectGooglePay,
  selectFromDropDown,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../actions/common');

describe('Feebearer with partial GooglePay payment', () => {
  test('Perform GooglePay transaction with feebearer and partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 10000,
        amount_due: 100000,
        amount_paid: 60000,
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
    await fillUserDetails(context, true);
    await handlePartialPayment(context, '600');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectGooglePay(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectFromDropDown(context, 'okhdfcbank');
    await verifyPartialAmount(context, '₹ 600');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
