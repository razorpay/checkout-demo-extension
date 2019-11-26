const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectUPIIDFromDropDown,
  enterUPIAccount,
  selectUPIApplication,
  submit,
  respondToUPIAjax,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
  setPreferenceForOffer,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  selectUPIApp,
  respondToQRAjax,
  validateQRImage,
} = require('../../actions/common');

describe('Offers QRCode payment', () => {
  test('Perform Offers QRCode transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
      personalization: false,
    };
    const preferences = makePreferences({
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
    await respondToQRAjax(context, '');
    await validateQRImage(context);
  });
});
