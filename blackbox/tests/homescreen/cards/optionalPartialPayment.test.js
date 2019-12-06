const { getTestData } = require('../../../actions');
const {
  submit,
  enterCardDetails,
  handleCardValidation,
  handleMockFailureDialog,
  verifyErrorMessage,
  retryTransaction,
  verifyPartialAmount,
  handleMockSuccessDialog,
} = require('../../../actions/common');

// New imports
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

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData(
    'perform card transaction with contact optional and partial payment enabled',
    {
      loggedIn: false,
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        optional: ['contact'],
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
)('Card tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);

    await handlePartialPayment(context, '100');

    await assertUserDetails(context);

    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context);
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleCardValidation(context);
    await handleMockFailureDialog(context);
    await verifyErrorMessage(context, 'The payment has already been processed');
    await retryTransaction(context);
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
