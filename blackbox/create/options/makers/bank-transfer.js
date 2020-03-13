function makeOptions(features, options) {
  options = {
    order_id: 'order_DhheFqhhT2RMur',
  };
  return options;
}

function makePreferences(features, preferences) {
  const { partialPayments } = features;

  if (partialPayments) {
    preferences.order = {
      amount: 400000,
      amount_due: 400000,
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
