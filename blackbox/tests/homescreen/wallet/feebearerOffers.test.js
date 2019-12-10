const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  handleFeeBearer,
  handleValidationRequest,
  retryPayzappWalletTransaction,
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
    'Perform wallet transaction with offers applied and feebearer enabled',
    {
      options: {
        amount: 200000,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
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
  test(title, async () => {
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
    await handleFeeBearer(context);

    await handleValidationRequest(context, 'fail');
    await retryPayzappWalletTransaction(context);
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await handleFeeBearer(context);

    await handleValidationRequest(context, 'pass');
  });
});
