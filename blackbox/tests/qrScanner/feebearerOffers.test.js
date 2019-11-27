const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  validateQRImage,
  respondToQRAjax,
  selectUPIApp,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
  handleFeeBearer,
} = require('../../actions/common');

describe('Customer Feebearer Offers QR Code payment', () => {
  test('Perform Offers QR Code transaction with customer feebearer', async () => {
    const options = {
      key: 'rzp_test_BlUXikp98tvz4X',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      offers: [
        {
          id: 'offer_Dcad1sICBaV2wI',
          name: 'UPI Offer Name',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text',
        },
        {
          id: 'offer_DcaetTeD4Gjcma',
          name: 'UPI Offer Name 2',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 2',
        },
        {
          id: 'offer_DcafkxTAseGAtT',
          name: 'UPI Offer Name 3',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 3',
        },
      ],
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
    });
    await setPreferenceForOffer(preferences);
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await selectUPIApp(context, '1');
    await handleFeeBearer(context, page);
    await respondToQRAjax(context, '');
    await validateQRImage(context);
  });
});
