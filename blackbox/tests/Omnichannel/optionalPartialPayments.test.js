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
  handlePartialPayment,
  verifyPartialAmount,
  enterOmnichannelPhoneNumber,
} = require('../../actions/common');
describe('Basic Omnichannel payment', () => {
  test('Perform Omnichannel transaction with partial payments and contact optional enabled', async () => {
    const options = {
      key: 'rzp_test_rFalxzSoQIEcFH',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
      optional: ['contact'],
      order: {
        amount: 60000,
        amount_due: 60000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await verifyOmnichannelPhoneNumber(context);
    await verifyPartialAmount(context, '₹ 1');
    await enterOmnichannelPhoneNumber(context);
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
