const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  //Bank Transfer
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
  verifyPartialAmount,
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

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'bank-transfer',
    testFeatures
  );

  const { partialPayments, optionalContact, optionalEmail } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Bank Transfer tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.bank_transfer = true;

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      const missingUserDetails = optionalContact && optionalEmail;
      const isHomeScreenSkipped = missingUserDetails && !partialPayments; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayments) {
        await handlePartialPayment(context, '2000');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      if (partialPayments) {
        await verifyPartialAmount(context, '₹ 2,000');
      }
      await selectPaymentMethod(context, 'bank_transfer');
      await returnVirtualAccounts(context);
      await verifyNeftDetails(context);
      await verifyRoundOffAlertMessage(context);
    });
  });
};
