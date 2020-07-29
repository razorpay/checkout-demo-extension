const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  selectPaymentMethod,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Perform upi collect transaction with personalization enabled', {
    options: {
      amount: 200,
      personalization: true,
    },
    loggedIn: true,
    anon: false,
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.customer.contact = '+918888888881';

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
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
