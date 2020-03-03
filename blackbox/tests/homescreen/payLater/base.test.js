const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectPayLaterPaymentMode,
  verifyPayLaterPaymentMode,
  handleValidationRequest,
  typeOTPandSubmit,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePayLaterOTPOrCustomerCardStatusRequest,
} = require('../actions');

describe.each(
  getTestData('Perform ePayLater transaction', {
    loggedIn: false,
    options: {
      amount: 5000,
      personalization: false,
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
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'paylater');
    await verifyPayLaterPaymentMode(context);
    await selectPayLaterPaymentMode(context);
    await handlePayLaterOTPOrCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context, '333333');
    await handlePayLaterOTPOrCustomerCardStatusRequest(context);
    await handleValidationRequest(context, 'pass');
  });
});
