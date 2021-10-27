const { ENDPOINT } = global;

const Customer = require('./customer.js');

const misc = {
  zestmoney: {
    success: 1,
    emi_plans: [
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 3,
        interest: 1.51,
        amount_per_month: 34844,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 6,
        interest: 1.75,
        amount_per_month: 18417,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 9,
        interest: 1.5,
        amount_per_month: 12612,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 12,
        interest: 1.5,
        amount_per_month: 9837,
      },
    ],
    ott: 'c0a166df881e3e',
    loan_url: ENDPOINT + '/loanurl',
  },
  epaylater: {
    success: 1,
    ott: 'c0a166df881e3e',
  },
  saved_methods: {
    success: 1,
    tokens: Customer.getTokens(),
    addresses: [
      {
        id: 1,
        name: 'Mayank',
        type: 'shipping_address',
        line1: '125/12, Ram Gali',
        line2: 'hathibhata',
        zipcode: '305001',
        city: 'Ajmer',
        state: 'Rajasthan',
        country: 'in',
        tag: 'Home',
      },
      {
        id: 2,
        name: 'Mayank',
        type: 'shipping_address',
        line1: '125/12, Ram Gali',
        line2: 'hathibhata',
        zipcode: '305001',
        city: 'Ajmer',
        state: 'Rajasthan',
        country: 'in',
        tag: 'Home',
      },
    ],
  },
};

const getMisc = (type) => {
  return misc[type];
};

module.exports = { getMisc };
