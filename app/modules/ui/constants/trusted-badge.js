const badges_text = {
  FjZg37JOiJDI0K: {
    list: getList('50+', '3 months', '3 months'),
  },
  FnsHdtMjq1a7j7: {
    list: getList('150+', '3 months', '3 months'),
  },
  FhZlzY1EMcTImZ: {
    list: getList('300+', '3 months', '3 months'),
  },
  FFsK7Ojsv5B8cb: {
    list: getList('400+', '4 months', '4 months'),
  },
  CDa7YMwXiWqCZz: {
    list: getList('600+', '20 months', '20 months'),
  },
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
