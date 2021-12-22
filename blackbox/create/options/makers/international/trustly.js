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
  if (!features.disabledTrustly) {
    preferences.methods = {
      ...preferences.methods,
      app: {
        trustly: 1,
      },
    };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
