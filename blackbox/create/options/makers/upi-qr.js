function makeOptions(features, options) {
  return options;
}

function makePreferences(features, preferences) {
  const { downtime, offers } = features;

  if (downtime) {
    preferences.payment_downtime = {
      entity: 'collection',
      count: 1,
      items: [
        {
          id: 'down_DEW7D9S10PEsl1',
          entity: 'payment.downtime',
          method: 'upi',
          begin: 1567686386,
          end: null,
          status: 'started',
          scheduled: false,
          severity: 'high',
          instrument: { vpa_handle: 'ALL' },
          created_at: 1567686387,
          updated_at: 1567686387,
        },
        {
          id: 'down_DEW7D9S10PEsl2',
          entity: 'payment.downtime',
          method: 'upi',
          begin: 1567686386,
          end: null,
          status: 'started',
          scheduled: false,
          severity: 'low',
          created_at: 1567686387,
          updated_at: 1567686387,
        },
      ],
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
