const { openSdkCheckout } = require('../../actions/checkout-sdk');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
  handlePartialPayment,
  verifyPartialAmount,
  selectOffer,
  verifyOfferApplied,
  viewOffers,
} = require('../../actions/common');

describe.skip('Basic upi payment', () => {
  test('Perform upi intent transaction with partial payments enabled and offers applied', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 100,
        amount_due: 100,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
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
    const context = await openSdkCheckout({
      page,
      options,
      preferences,
      apps: [{ package_name: 'in.org.npci.upiapp', app_name: 'BHIM' }],
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await verifyPartialAmount(context, '₹ 1');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await submit(context);
    await respondAndVerifyIntentRequest(context);
  });
});
