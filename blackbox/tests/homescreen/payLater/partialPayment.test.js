const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleValidationRequest,
  typeOTPandSubmit,
  verifyPartialAmount,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePayLaterOTPOrCustomerCardStatusRequest,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData('Perform ePayLater transaction with Partial payments enabled', {
    loggedIn: false,
    options: {
      amount: 5000,
      personalization: false,
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
  })
)('ePayLater tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.paylater = { epaylater: true };
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
    await verifyPartialAmount(context, '₹ 100');
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await handlePayLaterOTPOrCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context, '333333');
    await handlePayLaterOTPOrCustomerCardStatusRequest(context);
    await handlePayLaterOTPOrCustomerCardStatusRequest(context);
    await handleValidationRequest(context, 'pass');
  });
});
