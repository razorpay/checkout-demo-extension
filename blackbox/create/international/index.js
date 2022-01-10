const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');

const { getTestData } = require('../../actions');

const {
  // Generic
  proceed,

  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertEditUserDetailsAndBack,

  // Partial Payments
  handlePartialPayment,
} = require('../../tests/homescreen/actions');

module.exports = async function createCheckoutForInternational(
  testFeatures = {},
  method = 'international-providers'
) {
  const { features, preferences, options } = makeOptionsAndPreferences(
    method,
    testFeatures
  );

  const testData = getTestData('', {
    options,
    preferences,
    loggedIn: true,
  })[0];

  const { partialPayment, callbackUrl, optionalContact, optionalEmail } =
    features;

  const context = await openCheckoutWithNewHomeScreen({
    page,
    options: testData.options,
    preferences: testData.preferences,
    method: 'app',
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

  return {
    context,
    callbackUrl,
    ...testData,
  };
};
