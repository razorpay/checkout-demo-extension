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
  handleFeeBearer,
  enterOmnichannelPhoneNumber,
} = require('../../actions/common');
describe('Basic Omnichannel payment', () => {
  test('Perform Omnichannel transaction with customer feebearer and contact optional enabled', async () => {
    const options = {
      key: 'rzp_test_rFalxzSoQIEcFH',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
      fee_bearer: true,
      optional: ['contact'],
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
    await enterOmnichannelPhoneNumber(context);
    await submit(context);
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
