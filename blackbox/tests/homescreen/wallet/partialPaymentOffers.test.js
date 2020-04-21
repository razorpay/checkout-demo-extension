const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  handleValidationRequest,
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

describe.each(
  getTestData(
    'Perform wallet transaction with partial payments and Offers enabled',
    {
      loggedIn: false,
      options: {
        amount: 200000,
        personalization: false,
      },
      preferences: {
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
      },
    }
  )
)('Wallet tests', ({ preferences, title, options }) => {
  test.skip(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
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
    await verifyDiscountText(context, 'You save ₹20');
    await submit(context);
    await verifyPartialAmount(context, '₹ 100');

    await handleValidationRequest(context, 'pass');
  });
});
