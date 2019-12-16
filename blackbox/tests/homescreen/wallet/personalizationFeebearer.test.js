const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleOtpVerification,
  typeOTPandSubmit,
  handleValidationRequest,
  handleFeeBearer,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  verifyPersonalizationText,
  assertEditUserDetailsAndBack,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Perform Wallet with Personalization and feebearer transaction', {
    loggedIn: false,
    options: {
      amount: 60000,
      personalization: true,
    },
    preferences: {
      fee_bearer: true,
    },
  })
)('Wallet tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Wallet',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'wallet');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await handleFeeBearer(context);
    await handleOtpVerification(context);
    await typeOTPandSubmit(context);
    await handleValidationRequest(context, 'pass');
  });
});
