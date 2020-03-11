function makeOptions(features, options) {
  const { callbackUrl } = features;

  if (callbackUrl) {
    options = {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
  } else {
    options = {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
    };
  }

  return options;
}

function makePreferences(features, preferences) {
  preferences.order = {
    amount: 0,
    currency: 'INR',
    payment_capture: true,
    bank: 'HDFC',
    method: 'emandate',
  };
  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
