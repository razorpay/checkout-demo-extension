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
  handlePartialPayment,
  verifyPartialAmount,
} = require('../../actions/common');
describe.skip('Basic Omnichannel payment', () => {
  test('Perform Omnichannel transaction with offers and partial payments applied', async () => {
    const options = {
      key: 'rzp_test_rFalxzSoQIEcFH',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences({
      features: { google_pay_omnichannel: true },
      order: {
        amount: 60000,
        amount_due: 60000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
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
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await verifyOmnichannelPhoneNumber(context);
    await verifyPartialAmount(context, '₹ 1');
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
