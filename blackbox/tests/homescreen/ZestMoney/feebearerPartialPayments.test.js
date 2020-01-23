const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  typeOTPandSubmit,
  handleOtpVerificationForCardlessEMI,
  handleCardlessEMIPaymentCreation,
  selectZestMoneyEMIPlan,
  submit,
  handleFeeBearer,
  verifyPartialAmount,
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
    'Perform Cardless EMI - ZestMoney transaction with partial payments and customer feebearer enabled',
    {
      options: {
        amount: 500000,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
        order: {
          amount: 500000,
          amount_due: 500000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
      },
    }
  )
)('Cardless EMI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.cardless_emi = {
      earlysalary: true,
      zestmoney: true,
      flexmoney: true,
    };
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '3000');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
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