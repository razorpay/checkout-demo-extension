const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  selectBankNameFromGooglePayDropDown,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  assertPaymentMethods,
  fillUserDetails,
  proceed,
  assertUserDetails,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData('Perform GooglePay transaction with contact optional', {
    loggedIn: false,
    options: {
      amount: 200,
      personalization: false,
    },
    preferences: {
      optional: ['contact'],
    },
  })
)('GooglePay tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
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
    await assertEditUserDetailsAndBack(context);
    const paymentMethods = ['card', 'netbanking', 'wallet', 'upi'];
    await assertPaymentMethods(context, paymentMethods);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
