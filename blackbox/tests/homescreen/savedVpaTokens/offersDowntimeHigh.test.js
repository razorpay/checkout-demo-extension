const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
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
  assertEditUserDetailsAndBack,
  verifyMethodDisabled,
} = require('../actions');

describe.each(
  getTestData('Verify upi downtime - high with offers applied', {
    loggedIn: true,
    anon: false,
    options: {
      amount: 200,
      personalization: false,
    },
    preferences: {
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
            severity: 'high',
            instrument: { vpa_handle: 'ALL' },
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
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
    },
  })
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
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,990');
    await verifyDiscountAmountInBanner(context, '₹ 1,990');
    await verifyDiscountText(context, 'You save ₹10');
  });
});
