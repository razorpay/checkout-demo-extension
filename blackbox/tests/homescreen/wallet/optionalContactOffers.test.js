const { makePreferences } = require('../../../actions/preferences');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  handleWalletPopUp,
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

describe('Basic wallet payment', () => {
  test('Perform wallet transaction with offers and optional contact applied', async () => {
    const options = {
      key: 'rzp_test_o39NWyo4QjBTFF',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      offers: [
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DfJLos7WHTOGB5',
          name: 'Payzapp_Offer_3',
          payment_method: 'wallet',
          issuer: 'payzapp',
          display_text: 'Payzapp - Rs. 10 off',
        },
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DfJQsNytt7xVTe',
          name: 'AmazonPay_Offer_1',
          payment_method: 'wallet',
          issuer: 'amazonpay',
          display_text: '10% off with Amazon Pay',
        },
      ],
    });
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
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'payzapp');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await handleWalletPopUp(context);
  });
});
