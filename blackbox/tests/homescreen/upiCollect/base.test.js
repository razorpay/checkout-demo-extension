const { getTestData } = require('../../../actions');
const { visible } = require('../../../util');
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
      amount: 200,
      personalization: false,
    },
    loggedIn: true,
    keyless: true,
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);

    // only proceed if on contact/email screen
    // but not on method selection screen
    if (!(await context.page.$('#user-details'))) {
      await proceed(context);
    }
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'new');
    await enterUPIAccount(context, 'saranshgupta1995@okaxis');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await handleSaveVpaRequest(context);
    await respondToUPIPaymentStatus(context);
  });
});
