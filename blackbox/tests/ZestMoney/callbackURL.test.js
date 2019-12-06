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
  expectRedirectWithCallback,
  selectZestMoneyEMIPlan,
  submit,
} = require('../../actions/common');

describe('Cardless EMI tests', () => {
  test('perform Cardless EMI - ZestMoney transaction with callbackURL', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences();
    preferences.methods.cardless_emi = {
      earlysalary: true,
      zestmoney: true,
      flexmoney: true,
    };
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'cardless_emi');
    await selectCardlessEMIOption(context, 'ZestMoney');
    await handleCardlessEMIValidation(context);
    await typeOTPandSubmit(context, '5555');
    await handleOtpVerificationForCardlessEMI(context);
    await selectZestMoneyEMIPlan(context, 1);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'cardless_emi' });
  });
});
