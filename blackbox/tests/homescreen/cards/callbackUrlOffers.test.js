const { getTestData } = require('../../../actions');
const {
  submit,
  enterCardDetails,
  expectRedirectWithCallback,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
} = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData(
    'perform successful card transaction with callback URL and offers enabled',
    {
      loggedIn: false,
      options: {
        amount: 20000,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
        offers: [
          {
            original_amount: 200000,
            amount: 198000,
            id: 'offer_DdMaQ3KHyKxcDN',
            name: 'Card Offer VISA',
            payment_method: 'card',
            payment_network: 'VISA',
          },
          {
            original_amount: 200000,
            amount: 199000,
            id: 'offer_DdO7XZ0ILq4u8a',
            name: 'Card Offer American Express',
            payment_method: 'card',
            payment_network: 'AMEX',
            display_text: 'Bank Offer - American Express -15% off',
          },
          {
            original_amount: 200000,
            amount: 199000,
            id: 'offer_DdOL4XeZosJh2t',
            name: 'Card Offer - MasterCard 20',
            payment_method: 'card',
            payment_network: 'MC',
            display_text: 'Master Card Offer - 20% off',
          },
        ],
      },
    }
  )
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
