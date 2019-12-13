const { makePreferences } = require('../../../actions/preferences');
const { openSdkCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  respondAndVerifyIntentRequest,
  selectUPIApp,
  verifyPartialAmount,
  handleFeeBearer,
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

describe('Basic upi payment', () => {
  test('Perform upi intent transaction with feebearer and partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 100,
        amount_due: 100,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.upi = true;
    const context = await openSdkCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      apps: [{ package_name: 'in.org.npci.upiapp', app_name: 'BHIM' }],
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApp(context, '1');
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await handleFeeBearer(context, page);
    await respondAndVerifyIntentRequest(context);
  });
});
