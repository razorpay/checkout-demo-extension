const { makeOptions, getTestData } = require('../../../actions');
const { makePreferences } = require('../../../actions/preferences');

const {
  selectUPIApp,
  validateQRImage,
  responseWithQRImage,
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

const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData('Perform QR Code with optional contact transaction', {
    loggedIn: false,
    options: {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 20000,
      personalization: false,
    },
    preferences: {
      optional: ['contact'],
    },
  })
)('Perform QR Code transaction', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
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
    await selectUPIApp(context, '1');
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
