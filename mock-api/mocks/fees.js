const getFees = (_) => {
  // return {
  //   display: {
  //     amount: 100,
  //     original_amount: 10,
  //     razorpay_fee: 10,
  //   },
  //   input: {
  //     amount: 100,
  //     fee: 20,
  //   },
  // };

  return {
    display: {
      amount: 1.14,
      checkout_logo: 'https://cdn.razorpay.com/logo.png',
      custom_branding: false,
      fees: 0.14,
      org_logo: '',
      org_name: 'Razorpay Software Private Ltd',
      originalAmount: 1,
      original_amount: 1,
      razorpay_fee: 0.12,
      tax: 0.02,
    },
    input: {
      amount: 103,
      bank: 'HDFC',
      contact: '+918888888888',
      currency: 'INR',
      email: 'qa.testing@razorpay.com',
      fee: 3,
      method: 'netbanking',
      order_id: 'order_HskZEQGVIEoktp',
    },
  };
};

module.exports = { getFees };
