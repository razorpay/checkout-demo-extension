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
} = require('../../actions/common');
describe('Basic Omnichannel payment', () => {
  test('Perform Omnichannel transaction with customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_live_rFalxzSoQIEcFH',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
      fee_bearer: true,
    });
    preferences.methods.upi = true;
    preferences.mode = 'live';
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
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
