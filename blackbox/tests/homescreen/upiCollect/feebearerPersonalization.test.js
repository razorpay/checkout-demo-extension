const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleUPIAccountValidation,
  handleSaveVpaRequest,
  respondToUPIPaymentStatus,
  handleFeeBearer,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData(
    'Perform upi collect transaction with personalization and customer feebearer enabled',
    {
      options: {
        amount: 200,
        personalization: true,
      },
      preferences: {
        fee_bearer: true,
      },
    }
  )
)('UPI tests', ({ preferences, title, options }) => {
  test.skip(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'UPI',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPersonalizationText(context, 'upi');
    await selectPersonalizationPaymentMethod(context, 1);
    await submit(context);
    await handleUPIAccountValidation(context, 'dsd@okhdfcbank');
    await handleFeeBearer(context);
    await handleSaveVpaRequest(context);
    await respondToUPIPaymentStatus(context);
  });
});
