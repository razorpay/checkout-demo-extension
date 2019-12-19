const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectUPIMethod,
  submit,
  respondToUPIAjax,
  verifyOmnichannelPhoneNumber,
  respondToUPIPaymentStatus,
  retryTransaction,
  respondToUPIAjaxWithFailure,
  handleUPIAccountValidation,
  selectBankNameFromGooglePayDropDown,
  enterUPIAccount,
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
    'Perform Omnichannel transaction with no wallet linked to current number',
    {
      options: {
        amount: 60000,
        personalization: false,
      },
      preferences: {
        features: { google_pay_omnichannel: true },
      },
    }
  )
)('Omnichannel tests', ({ preferences, title, options }) => {
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
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await verifyOmnichannelPhoneNumber(context);
    await submit(context);
    await respondToUPIAjaxWithFailure(context);
    await retryTransaction(context);
    await enterUPIAccount(context, 'sjain');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'sjain@okhdfcbank', false);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
