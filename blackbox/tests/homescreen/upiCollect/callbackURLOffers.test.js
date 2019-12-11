const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  expectRedirectWithCallback,
  setPreferenceForOffer,
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
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData(
    'Perform upi collect transaction with callbackURL and offers applied',
    {
      loggedIn: false,
      options: {
        amount: 200000,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
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
      },
    }
  )
)('UPI tests', ({ preferences, title, options }) => {
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
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'BHIM');
    await enterUPIAccount(context, 'BHIM');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,990');
    await verifyDiscountAmountInBanner(context, '₹ 1,990');
    await verifyDiscountText(context, 'You save ₹ 10');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
