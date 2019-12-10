const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectBank,
  assertNetbankingPage,
  submit,
  passRequestNetbanking,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
  handleMockSuccessDialog,
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
  getTestData('perform netbaking transaction with offers applied', {
    options: {
      amount: 200000,
      personalization: false,
    },
    preferences: {
      offers: [
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DeyaOUCgXd49pt',
          name: 'Netbanking_SBI_1',
          payment_method: 'netbanking',
          issuer: 'SBIN',
          display_text: 'Rs. 20 off on SBI Netbanking',
        },
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DeycnL6DJueSQ6',
          name: 'Netbanking_HDFC_1',
          payment_method: 'netbanking',
          issuer: 'HDFC',
          display_text: 'Rs. 20 off on HDF Netbanking',
        },
      ],
    },
  })
)('Netbanking tests', ({ preferences, title, options }) => {
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
    await selectPaymentMethod(context, 'netbanking');
    await assertNetbankingPage(context);
    await selectBank(context, 'SBIN');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
