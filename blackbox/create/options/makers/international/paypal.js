function makeOptions(features, options) {
  const { optionalContact, optionalEmail } = features;

  if (optionalContact && optionalEmail) {
    options.key = 'rzp_test_optionalContactAndEmail'; // TODO: Make a merchant with both optional
  } else if (optionalContact) {
    options.key = 'rzp_test_o39NWyo4QjBTFF';
  } else if (optionalEmail) {
    options.key = 'rzp_test_optionalEmail'; // TODO: Make a merchant with email optional
  }

  options.currency = 'USD';

  return options;
}

function makePreferences(features, preferences) {
  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
