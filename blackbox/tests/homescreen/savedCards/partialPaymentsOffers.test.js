const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleCardValidation,
  handleMockSuccessDialog,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
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
    'Perform saved card transaction with partial payments and offers applied',
    {
      loggedIn: false,
      options: {
        amount: 200,
        personalization: true,
        remember_customer: true,
      },
      preferences: {
        order: {
          amount: 20000,
          amount_due: 20000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
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
)('Saved Card tests', ({ preferences, title, options }) => {
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
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await verifyPartialAmount(context, '₹ 100');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});