const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  enterCardDetails,
  submit,
  selectEMIPlanWithoutOffer,
  verifyEMIPlansWithoutOffers,
  expectRedirectWithCallback,
  verifyPartialAmount,
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
    'Perform EMI transaction with partial payments and callback URL enabled',
    {
      loggedIn: false,
      options: {
        amount: 500000,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
        order: {
          amount: 500000,
          amount_due: 500000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
      },
    }
  )
)('EMI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '3000');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await submit(context);
    await verifyEMIPlansWithoutOffers(context, '6');
    await selectEMIPlanWithoutOffer(context, '2');
    await verifyPartialAmount(context, '₹ 3,000');
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'emi' });
  });
});
