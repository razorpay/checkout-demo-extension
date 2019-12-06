const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  typeOTPandSubmit,
  handleOtpVerificationForCardlessEMI,
  handleCardlessEMIPaymentCreation,
  selectZestMoneyEMIPlan,
  submit,
  handlePartialPayment,
  verifyPartialAmount,
  handleFeeBearer,
} = require('../../actions/common');

describe('Cardless EMI tests', () => {
  test('perform Cardless EMI - ZestMoney transaction with partial payments and customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 500000,
        amount_due: 500000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.cardless_emi = {
      earlysalary: true,
      zestmoney: true,
      flexmoney: true,
    };
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '3000');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'cardless_emi');
    await verifyPartialAmount(context, '₹ 3,000');
    await selectCardlessEMIOption(context, 'ZestMoney');
    await handleFeeBearer(context);
    await handleCardlessEMIValidation(context);
    await typeOTPandSubmit(context);
    await handleOtpVerificationForCardlessEMI(context);
    await selectZestMoneyEMIPlan(context, 1);
    await submit(context);
    await handleFeeBearer(context);
    await handleCardlessEMIPaymentCreation(context);
  });
});
