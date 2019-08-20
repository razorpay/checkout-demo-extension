const without_feature = {
  options: {
    theme: {
      color: '#528FF0',
    },
    image: null,
    remember_customer: true,
  },
  fee_bearer: false,
  version: 1,
  mode: 'live',
  magic: true,
  methods: {
    entity: 'methods',
    card: true,
    debit_card: true,
    credit_card: true,
    prepaid_card: true,
    card_networks: {
      AMEX: 1,
      DICL: 1,
      MC: 1,
      MAES: 1,
      VISA: 1,
      JCB: 1,
      RUPAY: 1,
      BAJAJ: 0,
    },
    amex: true,
    upi: true,
    upi_intent: true,
  },
  global: true,
};

const with_feature = JSON.parse(JSON.stringify(without_feature));

with_feature.features = {
  google_pay_omnichannel: true,
};

module.exports = {
  with_feature,
  without_feature,
};
