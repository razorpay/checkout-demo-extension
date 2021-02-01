const badges_text = {
  FjZg37JOiJDI0K: {
    list: getList('50+', '3', '3'),
  },
  FnsHdtMjq1a7j7: {
    list: getList('150+', '3', '3'),
  },
  FhZlzY1EMcTImZ: {
    list: getList('300+', '3', '3'),
  },
  FFsK7Ojsv5B8cb: {
    list: getList('400+', '4', '4'),
  },
  CDa7YMwXiWqCZz: {
    list: getList('600+', '20', '20'),
  },
  GUHRJkzqlJHB95: {
    list: getList('2000+', '9', '8'),
  },
  CQb8Hvj0vXJHqR: {
    list: getList('2000+', '10 months', '9 months'),
  },
  '10000000000000': {
    list: getList('2000+', '9', '8'),
  },
};

function getList(customersNo, securedMonths, noFraudTime) {
  return {
    customersNo,
    securedMonths,
    noFraudTime,
  };
}

export default badges_text;
