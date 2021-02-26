exports.verifyPopupLoadingScreen = (popup, razorpayInstance) => {};

exports.flowTests = [
  { name: 'Card Payment', type: 'card' },
  { name: 'Card EMI Payment', type: 'emi' },
  { name: 'NetBanking', type: 'netbanking' },
  { name: 'Wallets', type: 'wallet' },
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
    }
    case 'wallet': {
      data = {
        ...data,
        method: 'wallet',
        wallet: 'phonepe',
      };
    }
    case 'powerwallet': {
      data = {
        ...data,
        method: 'wallet',
        wallet: 'freecharge',
      };
    }
    default:
      break;
  }
  return { ...data, ...override };
};
