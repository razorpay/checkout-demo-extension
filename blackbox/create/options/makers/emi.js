function makeOptions(features, options) {
  options.amount = 500000;
  return options;
}

function makePreferences(features, preferences) {
  const { downtime, offers, partialPayment } = features;

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

  if (offers) {
    preferences.offers = [
      {
        id: 'offer_DWcU6U9B3jV8Aa',
        name: 'No Cost EMI - HDFC',
        payment_method: 'emi',
        issuer: 'HDFC',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcYItBeDeYSr3',
        name: 'No Cost EMI - Standard Chartered',
        payment_method: 'emi',
        issuer: 'SCBL',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcZK1ZHr9nCW0',
        name: 'No Cost EMI - AXIS',
        payment_method: 'emi',
        issuer: 'UTIB',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcahvl33wimnY',
        name: 'No Cost EMI - Indusind',
        payment_method: 'emi',
        issuer: 'INDB',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcbYlDBNz2Zyt',
        name: 'No Cost EMI - RBL',
        payment_method: 'emi',
        issuer: 'RATN',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcdgbZjWPlmou',
        name: 'No Cost EMI - ICICI',
        payment_method: 'emi',
        issuer: 'ICIC',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcfDUXq0X08U6',
        name: 'No Cost EMI - Kotak ',
        payment_method: 'emi',
        issuer: 'KKBK',
        emi_subvention: true,
      },
      {
        id: 'offer_DWcgB9L2MBVGwZ',
        name: 'No Cost EMI - SBI Bank',
        payment_method: 'emi',
        issuer: 'SBIN',
        emi_subvention: true,
      },
      {
        id: 'offer_DWchUIIT6QYX76',
        name: 'No Cost EMI - AMEX',
        payment_method: 'emi',
        payment_network: 'AMEX',
        emi_subvention: true,
      },
    ];
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
