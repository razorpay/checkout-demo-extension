const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  selectWallet,
  assertWalletPage,
  submit,
  expectRedirectWithCallback,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
} = require('../../actions/common');

describe('Basic wallet payment', () => {
  test('Perform wallet transaction with callbackURL enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
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
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
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
    await expectRedirectWithCallback(context, {
      method: 'wallet',
      wallet: 'payzapp',
    });
  });
});