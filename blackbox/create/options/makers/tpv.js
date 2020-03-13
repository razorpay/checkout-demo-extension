function makeOptions(features, options) {
  return options;
}

function makePreferences(features, preferences) {
  const { offers, partialPayment } = features;

  if (partialPayment) {
    preferences.order.account_number = '1234567891234567';
    preferences.order.bank = 'SBIN';
  } else {
    preferences.order = {
      amount: 20000,
      currency: 'INR',
      account_number: '1234567891234567',
      bank: 'SBIN',
    };
  }
  if (offers) {
    preferences.offers = [
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DeyaOUCgXd49pt',
        name: 'Netbanking_SBI_1',
        payment_method: 'netbanking',
        issuer: 'SBIN',
        display_text: 'Rs. 20 off on SBI Netbanking',
      },
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DeycnL6DJueSQ6',
        name: 'Netbanking_HDFC_1',
        payment_method: 'netbanking',
        issuer: 'HDFC',
        display_text: 'Rs. 20 off on HDF Netbanking',
      },
    ];
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
