const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  handleSaveVpaRequest,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
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
  getTestData('Perform upi collect transaction', {
    options: {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 0,
      personalization: false,
      recurring: true,
    },
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.order = {
      amount: 20000,
      currency: 'INR',
      method: 'upi',
      token: {
        max_amount: 2000,
        frequency: 'weekly',
        recurring_type: 'after',
        start_time: Date.now(),
        end_time: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
    };
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
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'new');
    await enterUPIAccount(context, 'saranshgupta1995@okaxis');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await respondToUPIAjax(context, { recurring: true });
    await respondToUPIPaymentStatus(context);
  });
});
