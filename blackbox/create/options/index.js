const Makers = require('./makers');

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
  recurringOrder,
  amount = 200,
}) {
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount: amount,
    personalization: false,
  };

  if (personalization) {
    options.personalization = true;
  }

  if (keyless || partialPayment || recurringOrder) {
    delete options.key;
    options.order_id = 'rzp_test_1DP5mmOlF5G5ag';
  }

  if (recurringOrder) {
    options.recurring = 1;
  }

  if (timeout) {
    options.timeout = 200;
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
function makeTestPreferences(
  {
    partialPayment,
    feeBearer,
    optionalContact,
    optionalEmail,
    recurringOrder,
    hasMerchantPolicy,
  },
  { method }
) {
  const preferences = {
    features: {
      show_email_on_checkout: true,
      email_optional_oncheckout: false,
    },
  };

  if (feeBearer) {
    preferences.fee_bearer = true;
  }

  if (optionalContact || optionalEmail) {
    preferences.optional = [];

    if (optionalEmail) {
      preferences.optional.push('email');
      preferences.features.email_optional_oncheckout = true;
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

  if (recurringOrder && method === 'card') {
    preferences.order = {
      amount: 100,
      amount_due: 100,
      amount_paid: 0,
      auth_type: null,
      currency: 'INR',
      first_payment_min_amount: null,
      partial_payment: false,
    };
  }

  preferences.feature_overrides = {};

  if (hasMerchantPolicy) {
    preferences.merchant_policy = {
      url: 'https://sme.np.razorpay.in/compliance/K0obrWayUIqw40',
      display_name: 'About Merchant',
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
  const keys = Object.keys(features).filter((feature) => features[feature]);

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
  let preferences = makeTestPreferences(features, {
    method,
  });

  const prefFeatures = preferences.features;

  const maker = Makers[method];

  options = maker.makeOptions(features, options);
  preferences = maker.makePreferences(features, preferences);
  preferences.features = {
    ...prefFeatures,
    ...(preferences.features || {}),
  };

  return {
    options,
    preferences,
    features,
    title: getFeaturesString(features),
  };
}

module.exports = makeOptionsAndPreferences;
