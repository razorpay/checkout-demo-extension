const makeOptionsAndPreferences = require('../options/index.js');
const { getTestData } = require('../../actions');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');

const {
  // Generic
  handleFeeBearer,
  expectRedirectWithCallback,
  passRequestWallet,
  handleMockSuccessDialog,
} = require('../../actions/common');

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

  // Partial Payments
  handlePartialPayment,
} = require('../../tests/homescreen/actions');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'international-paypal',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    optionalContact,
    optionalEmail,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('International PayPal Payments', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.wallet.paypal = true;
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        withSiftJS: false,
      });
      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayment) {
        await handlePartialPayment(context, '100');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context, ['card', 'paypal']);

      // Select PayPal
      await selectPaymentMethod(context, 'paypal');

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (callbackUrl) {
        await expectRedirectWithCallback(context, { method: 'wallet' });
      } else {
        // Respond to payment creation request
        await passRequestWallet(context);

        // Handle popup
        await handleMockSuccessDialog(context);
      }
    });
  });
};
