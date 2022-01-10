function makeOptions(features, options) {
  const {
    optionalContact,
    optionalEmail,
    currency = 'USD',
    personalization,
  } = features;

  if (optionalContact && optionalEmail) {
    options.key = 'rzp_test_optionalContactAndEmail';
  } else if (optionalContact) {
    options.key = 'rzp_test_o39NWyo4QjBTFF';
  } else if (optionalEmail) {
    options.key = 'rzp_test_optionalEmail';
  }

  options.personalization = personalization;

  options.currency = currency;

  return options;
}

function makePreferences(features, preferences) {
  let app = {};

  if (features.testPoli) {
    app.poli = 1;
  }

  if (features.testTrustly) {
    app.trustly = 1;
  }

  preferences.methods = {
    ...preferences.methods,
    wallet: {
      paypal: true,
    },
    card: true,
    app,
  };

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
