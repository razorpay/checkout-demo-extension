function makeOptions(features, options) {
  options.currency = features.currency || 'INR';

  return options;
}

function makePreferences(features, preferences) {
  const { offers, partialPayment, dcc } = features;

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

  if (offers) {
    preferences.offers = [
      {
        original_amount: 200000,
        amount: 198000,
        id: 'offer_DdMaQ3KHyKxcDN',
        name: 'Card Offer VISA',
        payment_method: 'card',
        payment_network: 'VISA',
      },
      {
        original_amount: 200000,
        amount: 199000,
        id: 'offer_DdO7XZ0ILq4u8a',
        name: 'Card Offer American Express',
        payment_method: 'card',
        payment_network: 'AMEX',
        display_text: 'Bank Offer - American Express -15% off',
      },
      {
        original_amount: 200000,
        amount: 199000,
        id: 'offer_DdOL4XeZosJh2t',
        name: 'Card Offer - MasterCard 20',
        payment_method: 'card',
        payment_network: 'MC',
        display_text: 'Master Card Offer - 20% off',
      },
    ];
  }

  if (dcc) {
    preferences.features = { dcc: true };
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
