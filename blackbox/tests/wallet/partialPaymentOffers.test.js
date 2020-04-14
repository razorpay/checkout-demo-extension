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
  typeOTPandSubmit,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
  handlePartialPayment,
  verifyPartialAmount,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
} = require('../../actions/common');

describe.skip('Wallet tests', () => {
  test('Wallet payment with partial payment', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200000,
      personalization: false,
    };
    const preferences = makePreferences({
      order: {
        amount: 200000,
        amount_due: 200000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
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
    await handlePartialPayment(context, '100');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'payzapp');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹20');
    await submit(context);
    await verifyPartialAmount(context, '₹ 100');

    await handleValidationRequest(context, 'fail');
    await retryWalletTransaction(context);

    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹20');
    await submit(context);

    await handleValidationRequest(context, 'pass');
  });
});
