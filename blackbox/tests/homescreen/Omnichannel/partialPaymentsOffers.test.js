const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
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
  verifyPartialAmount,
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

describe.each(
  getTestData(
    'Perform Omnichannel transaction with offers and partial payments applied',
    {
      loggedIn: false,
      options: {
        amount: 60000,
        personalization: false,
      },
      preferences: {
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
      },
    }
  )
)('Omnichannel tests', ({ preferences, title, options }) => {
  test.skip(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'omnichannel');
    await verifyOmnichannelPhoneNumber(context);
    await verifyPartialAmount(context, '₹ 1');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    // await verifyDiscountAmountInBanner(context, '₹ 1,980'); /* Issue reported CE-963*/
    await verifyDiscountText(context, 'You save ₹20');
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
