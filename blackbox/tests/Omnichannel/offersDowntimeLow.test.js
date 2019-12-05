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
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
  verifyLowDowntime,
} = require('../../actions/common');
describe('Basic Omnichannel payment', () => {
  test('Verify Omnichannel downtime - Low with offers applied', async () => {
    const options = {
      key: 'rzp_test_rFalxzSoQIEcFH',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
      payment_downtime: {
        entity: 'collection',
        count: 1,
        items: [
          {
            id: 'down_DEW7D9S10PEsl1',
            entity: 'payment.downtime',
            method: 'upi',
            begin: 1567686386,
            end: null,
            status: 'started',
            scheduled: false,
            severity: 'low',
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
      offers: [
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_Dcad1sICBaV2wI',
          name: 'UPI Offer Name',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text',
        },
      ],
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
    await verifyLowDowntime(context, 'UPI');
    await selectUPIMethod(context, 'Google Pay');
    await verifyOmnichannelPhoneNumber(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    // await verifyDiscountAmountInBanner(context, '₹ 1,980'); /* Issue reported CE-963*/
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
