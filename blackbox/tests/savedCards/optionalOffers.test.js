const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleCardValidation,
  handleMockSuccessDialog,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with offers and contact optional applied', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      remember_customer: true,
    };
    const preferences = makePreferences({
      optional: ['contact'],
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
    });
    let context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context, '5555');
    await respondSavedCards(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
