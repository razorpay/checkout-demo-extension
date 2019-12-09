const { makePreferences } = require('../../../actions/preferences');
const { makeOptions, getTestData } = require('../../../actions');

const {
  selectBankNameFromGooglePayDropDown,
  submit,
  respondToUPIAjax,
  handleFeeBearer,
  enterUPIAccount,
  selectUPIMethod,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
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

const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData('Feebearer GooglePay Payment', {
    loggedIn: false,
  })
)(
  'Perform GooglePay transaction with feebearer enabled',
  ({ preferences, title }) => {
    test(title, async () => {
      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag',
        amount: 60000,
        personalization: false,
      };
      const preferences = makePreferences({ fee_bearer: true });

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
      const paymentMethods = ['card', 'netbanking', 'wallet', 'upi'];
      await assertPaymentMethods(context, paymentMethods);
      await selectPaymentMethod(context, 'upi');
      await selectUPIMethod(context, 'Google Pay');
      await enterUPIAccount(context, 'scbaala');
      await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
      await submit(context);
      await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
      await handleFeeBearer(context, page);
      await respondToUPIAjax(context);
      await respondToUPIPaymentStatus(context);
    });
  }
);
