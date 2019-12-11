const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  setPreferenceForOffer,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
  selectBankNameFromGooglePayDropDown,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData(
    'Perform GooglePay transaction with offers and optional contact applied',
    {
      loggedIn: false,
      options: {
        amount: 20000,
        personalization: false,
      },
      preferences: {
        optional: ['contact'],
        offers: [
          {
            original_amount: 20000,
            amount: 19000,
            id: 'offer_Dcad1sICBaV2wI',
            name: 'UPI Offer Name',
            payment_method: 'upi',
            display_text: 'UPI Offer Display Text',
          },
          {
            original_amount: 20000,
            amount: 19900,
            id: 'offer_DcaetTeD4Gjcma',
            name: 'UPI Offer Name 2',
            payment_method: 'upi',
            display_text: 'UPI Offer Display Text 2',
          },
          {
            original_amount: 20000,
            amount: 19900,
            id: 'offer_DcafkxTAseGAtT',
            name: 'UPI Offer Name 3',
            payment_method: 'upi',
            display_text: 'UPI Offer Display Text 3',
          },
        ],
      },
    }
  )
)('GooglePay tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    await setPreferenceForOffer(preferences);
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await assertEditUserDetailsAndBack(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 190');
    await verifyDiscountAmountInBanner(context, '₹ 190');
    await verifyDiscountText(context, 'You save ₹ 10');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await respondToUPIAjax(context, 'offer_id=' + preferences.offers[0].id);
    await respondToUPIPaymentStatus(context);
  });
});
