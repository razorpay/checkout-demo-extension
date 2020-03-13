function makeOptions(features, options) {
  const { optionalContact } = features;

  if (optionalContact) {
    options.key = 'rzp_test_o39NWyo4QjBTFF';
  }
  return options;
}

function makePreferences(features, preferences) {
  const { downtime, offers } = features;

  if (offers) {
    preferences.offers = [
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DfJLos7WHTOGB5',
        name: 'Payzapp_Offer_3',
        payment_method: 'wallet',
        issuer: 'payzapp',
        display_text: 'Payzapp - Rs. 10 off',
      },
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DfJQsNytt7xVTe',
        name: 'AmazonPay_Offer_1',
        payment_method: 'wallet',
        issuer: 'amazonpay',
        display_text: '10% off with Amazon Pay',
      },
    ];
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
