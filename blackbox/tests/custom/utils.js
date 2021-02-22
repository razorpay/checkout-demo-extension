export const verifyPopupLoadingScreen = (popup, razorpayInstance) => {};

export const getPaymentPayload = (method = 'card', override = {}) => {
  var data = {
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
      data['card[name]'] = 'arsh';
      data['card[cvv]'] = '123';
      break;
    }
    default:
      break;
  }
  return { ...data, ...override };
};
