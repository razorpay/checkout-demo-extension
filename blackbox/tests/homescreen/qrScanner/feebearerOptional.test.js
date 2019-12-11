const { makeOptions, getTestData } = require('../../../actions');
const { makePreferences } = require('../../../actions/preferences');

const {
  handleFeeBearer,
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
  getTestData(
    'Perform QR Code with optional contact and feebearer transaction',
    {
      loggedIn: false,
    }
  )
)('Perform QR Code transaction', ({ preferences, title }) => {
  test(title, async () => {
    const options = makeOptions();
    const preferences = makePreferences({
      fee_bearer: true,
      optional: ['contact'],
    });
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
    await handleFeeBearer(context);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await validateQRImage(context);
    await respondToUPIPaymentStatus(context);
  });
});
