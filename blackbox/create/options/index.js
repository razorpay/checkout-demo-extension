const defaultFeatures = {
  timeout: false,
  keyless: false,
  feeBearer: false,
  callbackUrl: false,
  optionalContact: false,
  optionalEmail: false,
  downtime: false,
  offers: false,
  partialPayment: false,
  personalization: false,
};

/**
 * Makes options for the test
 * @param {Object} param0
 *
 * @returns {Object}
 */
function makeTestOptions({
  partialPayment,
  keyless,
  timeout,
  callbackUrl,
  personalization,
}) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: 200,
    personalization: false,
  };

  if (personalization) {
    options.personalization = true;
  }

  if (keyless || partialPayment) {
    delete options.key;
    options.order_id = 'rzp_test_1DP5mmOlF5G5ag';
  }

  if (timeout) {
    options.timeout = 2;
  }

  if (callbackUrl) {
    options.callback_url =
      'http://www.merchanturl.com/callback?test1=abc&test2=xyz';
    options.redirect = true;
  }

  return options;
}

/**
 * Makes preferences for the test
 * @param {Object} param0
 *
 * @returns {Object}
 */
function makeTestPreferences({
  partialPayment,
  feeBearer,
  optionalContact,
  optionalEmail,
}) {
  const preferences = {};

  if (feeBearer) {
    preferences.fee_bearer = true;
  }

  if (optionalContact || optionalEmail) {
    preferences.optional = [];

    if (optionalEmail) {
      preferences.optional.push('email');
    }

    if (optionalContact) {
      preferences.optional.push('contact');
    }
  }

  if (partialPayment) {
    preferences.order = {
      amount: 20000,
      amount_due: 20000,
      amount_paid: 0,
      currency: 'INR',
      first_payment_min_amount: null,
      partial_payment: true,
    };
  }

  return preferences;
}

/**
 * Makes a string from the features
 * @param {Object} features
 *
 * @returns {string}
 */
function getFeaturesString(features) {
  const keys = Object.keys(features).filter(feature => features[feature]);

  return keys.join(', ');
}

/**
 * Makes options and preferences for tests of a given method.
 * @param {string} method
 * @param {Object} features
 *
 * @returns {Object}
 */
function makeOptionsAndPreferences(method, features = {}) {
  features = {
    ...defaultFeatures,
    ...features,
  };

  let options = makeTestOptions(features);
  let preferences = makeTestPreferences(features);

  const maker = require(`./${method}`);

  options = maker.makeOptions(features, options);
  preferences = maker.makePreferences(features, preferences);

  return {
    options,
    preferences,
    features,
    title: getFeaturesString(features),
  };
}

module.exports = makeOptionsAndPreferences;
