exports.verifyPopupLoadingScreen = (popup, razorpayInstance) => {};

exports.flowTests = [
  { name: 'Card Payment', type: 'card' },
  { name: 'Card EMI Payment', type: 'emi' },
  { name: 'NetBanking', type: 'netbanking' },
  { name: 'Wallets', type: 'wallet' },
  { name: 'UPI Collect', type: 'upicollect', skipAjax: true },
  {
    name: 'Powerwallet',
    type: 'wallet',
    skipAjax: true,
    override: { wallet: 'freecharge' },
  },
  {
    name: 'Cardless EMI',
    type: 'cardless_emi',
    skipAjax: true,
    override: { provider: 'zestmoney' },
  },
  {
    name: 'Paylater',
    type: 'paylater',
    skipAjax: true,
    override: { provider: 'icic' },
  },
  { // hdfc paylater handle differently based on create/ajax request
    name: 'Paylater - HDFC',
    type: 'paylater',
    skipAjax: false,
    override: { provider: 'hdfc' },
  },
];

exports.getPaymentPayload = (method = 'card', override = {}) => {
  let data = {
    amount: 100,
    currency: 'INR',
    email: 'test@razorpay.com',
    contact: '9999999999',
  };
  switch (method) {
    case 'card': {
      data.method = 'card';
      data['card[number]'] = '4111111111111111';
      data['card[expiry_month]'] = '04';
      data['card[expiry_year]'] = '22';
      data['card[name]'] = 'QA';
      data['card[cvv]'] = '123';
      break;
    }
    case 'netbanking': {
      data.method = 'netbanking';
      data.bank = 'SBIN';
      break;
    }
    case 'emi': {
      data = {
        ...data,
        method: 'emi',
        emi_duration: 9,
        'card[name]': 'QA',
        'card[number]': '5241810000000000',
        'card[cvv]': '566',
        'card[expiry_month]': '10',
        'card[expiry_year]': '22',
      };
      break;
    }
    case 'wallet': {
      data = {
        ...data,
        method: 'wallet',
        wallet: 'phonepe',
      };
      break;
    }
    case 'upicollect': {
      data = {
        ...data,
        method: 'upi',
        upi: {
          vpa: 'testing@ybl',
          flow: 'collect',
        },
      };
      break;
    }
    case 'cardless_emi': {
      data = {
        ...data,
        method: 'cardless_emi',
        amount: 900000,
      };
      break;
    }
    case 'paylater': {
      data = {
        ...data,
        method: 'paylater',
        amount: 900000,
      };
      break;
    }
    default:
      break;
  }
  return { ...data, ...override };
};
