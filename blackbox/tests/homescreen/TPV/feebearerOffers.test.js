const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  verifyAutoSelectBankTPV,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
  handleFeeBearer,
} = require('../../../actions/common');

const { assertBasicDetailsScreen, fillUserDetails } = require('../actions');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with customer feebearer and offers enabled',
    {
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
        order: {
          amount: 20000,
          currency: 'INR',
          account_number: '1234567891234567',
          bank: 'SBIN',
        },
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
    }
  )
)('Third Party Verification test', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await handleFeeBearer(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
