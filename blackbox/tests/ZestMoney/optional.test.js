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
} = require('../../actions/common');

describe('Cardless EMI tests', () => {
  test('perform Cardless EMI - ZestMoney transaction with contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
    });
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
    await selectCardlessEMIOption(context, 'zestmoney');
    await handleCardlessEMIValidation(context);
    await typeOTPandSubmit(context);
    await handleOtpVerificationForCardlessEMI(context);
    await selectZestMoneyEMIPlan(context, 1);
    await submit(context);
    await handleCardlessEMIPaymentCreation(context);
  });
});
