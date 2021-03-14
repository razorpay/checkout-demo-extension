function makeOptions(features, options) {
  return options;
}

function makePreferences(features, preferences) {
  const { downtimeHigh, downtimeLow, offers } = features;

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
          instrument: { psp: 'google_pay' },
          created_at: 1567686387,
          updated_at: 1567686387,
        },
      ],
    };
  }

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
          instrument: { psp: 'google_pay' },
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
        amount: 199000,
        id: 'offer_Dcad1sICBaV2wI',
        name: 'UPI Offer Name',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text',
      },
      {
        original_amount: 200000,
        amount: 199000,
        id: 'offer_DcaetTeD4Gjcma',
        name: 'UPI Offer Name 2',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text 2',
      },
      {
        original_amount: 200000,
        amount: 199000,
        id: 'offer_DcafkxTAseGAtT',
        name: 'UPI Offer Name 3',
        payment_method: 'upi',
        display_text: 'UPI Offer Display Text 3',
      },
    ];
  }

  return preferences;
}

module.exports = {
  makeOptions,
  makePreferences,
};
