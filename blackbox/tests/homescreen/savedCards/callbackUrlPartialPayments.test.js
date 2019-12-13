const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  expectRedirectWithCallback,
  verifyPartialAmount,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData(
    'Perform saved card transaction with callback URL and partial payments enabled',
    {
      loggedIn: false,
      options: {
        amount: 200,
        personalization: true,
        remember_customer: true,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
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
      },
    }
  )
)('Saved Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
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
    await verifyPartialAmount(context, '₹ 100');
    await selectSavedCardAndTypeCvv(context);
    await submit(context);
    await expectRedirectWithCallback(context, { method: 'card' });
  });
});
