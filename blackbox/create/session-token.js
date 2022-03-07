const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { verifyTokenPresentInRequest } = require('../actions/session-token');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  submit,

  // UPI
  selectUPIMethod,
  enterUPIAccount,
} = require('../actions/common');

const {
  // Generic
  proceed,

  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../tests/homescreen/actions');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-collect',
    testFeatures
  );

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Session Token test', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;

      if (preferences.customer) {
        preferences.customer.contact = '+918888888881';
      }

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        params: {
          session_token: 'DEMO_SESSION_TOKEN',
        },
      });

      await assertBasicDetailsScreen(context);

      await fillUserDetails(context, '8888888881');
      await proceed(context);

      await assertUserDetails(context);
      await assertEditUserDetailsAndBack(context);

      await assertPaymentMethods(context);
      await selectPaymentMethod(context, 'upi');

      await selectUPIMethod(context, 'new');
      await enterUPIAccount(context, 'demo@okaxis');
      await submit(context);
      await verifyTokenPresentInRequest(context);
    });
  });
};
