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
  verifyOfferApplied,
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
  getTestData('Perform Cardless EMI - ZestMoney transaction', {
    options: {
      amount: 500000,
      personalization: false,
    },
    preferences: {},
  })
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
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'cardless_emi');
    await selectCardlessEMIOption(context, 'ZestMoney');
    await handleCardlessEMIValidation(context);
    await typeOTPandSubmit(context);
    await handleOtpVerificationForCardlessEMI(context);
    await selectZestMoneyEMIPlan(context, 1);
    await verifyOfferApplied(context);
    await submit(context);
    await handleCardlessEMIPaymentCreation(context);
  });
});
