const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  typeOTPandSubmit,
  handleOtpVerificationForCardlessEMI,
  expectRedirectWithCallback,
  selectZestMoneyEMIPlan,
  submit,
  handleFeeBearer,
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
  getTestData(
    'Perform Cardless EMI - ZestMoney transaction with callbackURL and customer feebearer enabled',
    {
      options: {
        amount: 500000,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
        fee_bearer: true,
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
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'cardless_emi');
    await selectCardlessEMIOption(context, 'zestmoney');
    await handleFeeBearer(context);
    await handleCardlessEMIValidation(context);
    await typeOTPandSubmit(context);
    await handleOtpVerificationForCardlessEMI(context);
    await selectZestMoneyEMIPlan(context, 1);
    await submit(context);
    await handleFeeBearer(context);
    await expectRedirectWithCallback(context, { method: 'cardless_emi' });
  });
});
