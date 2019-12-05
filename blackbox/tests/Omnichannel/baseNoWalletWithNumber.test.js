const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
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
} = require('../../actions/common');
describe('Basic Omnichannel payment', () => {
  test('Perform Omnichannel transaction with no wallet linked to current number', async () => {
    const options = {
      key: 'rzp_test_rFalxzSoQIEcFH',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
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
