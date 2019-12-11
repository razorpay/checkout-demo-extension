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
  verifyLowDowntime,
  verifyHighDowntime,
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
    'perform netbaking transaction with offers and downtime applied',
    {
      loggedIn: false,
      options: {
        amount: 200000,
        personalization: false,
      },
      preferences: {
        payment_downtime: {
          entity: 'collection',
          count: 2,
          items: [
            {
              id: 'down_DEW7D9S10PEsl1',
              entity: 'payment.downtime',
              method: 'netbanking',
              begin: 1567686386,
              end: null,
              status: 'started',
              scheduled: false,
              severity: 'high',
              instrument: {
                bank: 'ICIC',
              },
              created_at: 1567686387,
              updated_at: 1567686387,
            },
            {
              id: 'down_DEW7D9S10PEsl2',
              entity: 'payment.downtime',
              method: 'netbanking',
              begin: 1567686386,
              end: null,
              status: 'started',
              scheduled: false,
              severity: 'low',
              instrument: {
                bank: 'HDFC',
              },
              created_at: 1567686387,
              updated_at: 1567686387,
            },
          ],
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
    // await verifyHighDowntime(context, 'ICICI Bank');
    await selectBank(context, 'HDFC');
    await verifyLowDowntime(context, 'HDFC Bank');
    await viewOffers(context);
    await selectOffer(context, '2');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});