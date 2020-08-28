const { makePreferences } = require('../../../actions/preferences');
const { openSdkCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
  verifyPartialAmount,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
} = require('../actions');

describe('Basic upi payment', () => {
  test.skip('Perform upi intent transaction with partial payments enabled and offers applied', async () => {
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
          original_amount: 200000,
          amount: 199000,
          id: 'offer_Dcad1sICBaV2wI',
          name: 'UPI Offer Name',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text',
        },
        {
          original_amount: 200000,
          amount: 199000,
          id: 'offer_DcaetTeD4Gjcma',
          name: 'UPI Offer Name 2',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 2',
        },
        {
          original_amount: 200000,
          amount: 199000,
          id: 'offer_DcafkxTAseGAtT',
          name: 'UPI Offer Name 3',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 3',
        },
      ],
    });
    preferences.methods.upi = true;
    const context = await openSdkCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      upiApps: true,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await verifyPartialAmount(context, '₹ 1');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,990');
    await verifyDiscountAmountInBanner(context, '₹ 1,990');
    await verifyDiscountText(context, 'You save ₹10');
    await submit(context);
    await respondAndVerifyIntentRequest(context);
  });
});
