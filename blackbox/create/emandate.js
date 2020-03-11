const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic

  submit,
  expectRedirectWithCallback,
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../actions/common');

const {
  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertEmandateUserDetails,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'emandate',
    testFeatures
  );
  const {
    partialPayment,
    callbackUrl,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Emandate tests', ({ preferences, title, options }) => {
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context);
      }
      await proceed(context);

      if (missingUserDetails) {
        await assertEmandateUserDetails(context);
      }
      await verifyEmandateBank(context);
      await selectEmandateNetbanking(context);
      await fillEmandateBankDetails(context);
      await submit(context);
      if (callbackUrl) {
        await expectRedirectWithCallback(context, {
          method: 'emandate',
          bank: 'HDFC',
        });
      } else {
        await respondToUPIAjax(context);
        await respondToUPIPaymentStatus(context);
      }
    });
  });
};
