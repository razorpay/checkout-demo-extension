const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  enterCardDetails,
  handleCardValidation,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  handleMockSuccessDialog,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
} = require('../actions');

describe.each(
  getTestData('Perform a card order transaction - recurring', {
    options: {
      order_id: 'order_DfNAO0KJCH5WNY',
      personalization: false,
      recurring: 1,
    },
    preferences: {
      amount: 100,
      amount_due: 100,
      amount_paid: 0,
      auth_type: null,
      currency: 'INR',
      first_payment_min_amount: null,
      partial_payment: false,
    },
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await enterCardDetails(context, { recurring: true });
    await submit(context);
    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
