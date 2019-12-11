const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  typeOTPandSubmit,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
  verifyPartialAmount,
  handleFeeBearer,
} = require('../../../actions/common');

const {
  handlePartialPayment,
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.each(
  getTestData(
    'Perform wallet transaction with partial payments and customer feebearer enabled',
    {
      loggedIn: false,
      options: {
        amount: 60000,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
        order: {
          amount: 60000,
          amount_due: 60000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
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
    await handlePartialPayment(context, '100');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'freecharge');
    await submit(context);
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await verifyPartialAmount(context, '₹ 100');
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'fail');
    await retryWalletTransaction(context);

    await submit(context);
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);

    await handleValidationRequest(context, 'pass');
  });
});
