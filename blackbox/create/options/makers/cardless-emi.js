function makeOptions(features, options) {
  options = {
    amount: 500000,
  };

  return options;
}

function makePreferences(features, preferences) {
  const { partialPayment } = features;

  if (partialPayment) {
    preferences.order = {
      amount: 500000,
      amount_due: 500000,
      amount_paid: 0,
      currency: 'INR',
      first_payment_min_amount: null,
      partial_payment: true,
    };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
