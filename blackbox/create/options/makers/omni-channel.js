function makeOptions(features, options) {
  return options;
}

function makePreferences(features, preferences) {
  const { downtimeLow, downtimeHigh, offers } = features;

  preferences.features = { google_pay_omnichannel: true };

  if (downtimeLow) {
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
          severity: 'low',
          instrument: [],
          created_at: 1567686387,
          updated_at: 1567686387,
        },
      ],
    };
  }

  if (downtimeHigh) {
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
          instrument: [],
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
        id: 'offer_Dcad1sICBaV2wI',
        name: 'UPI Offer Name',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text',
      },
    ];
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
