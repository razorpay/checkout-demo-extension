const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  handleFeeBearer,
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
    'Perform upi collect transaction with customer feebearer enabled',
    {
      anon: false,
      loggedIn: true,
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
      },
    }
  )
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    // await assertBasicDetailsScreen(context);
    // await fillUserDetails(context);
    // await proceed(context);
    // await assertUserDetails(context);
    // await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'token');
    // await enterUPIAccount(context, 'BHIM');
    await submit(context);
    // await handleUPIAccountValidation(context, 'BHIM@upi');
    await handleFeeBearer(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
