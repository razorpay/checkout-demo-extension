const badges_text = {
  '10000000000000': {
    list: getList('10k+', '2+ years', '3 months'),
  },
};

function getList(customersNo, securedYears, noFraudTime) {
  return [
    `Trusted by ${customersNo} customers`,
    `Secured Razorpay merchant for ${securedYears}`,
    'Failed transaction will be refunded instantly',
    `No fraud transaction for last ${noFraudTime}`,
  ];
}

export default badges_text;
