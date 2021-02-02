const badges_text = {
  FjZg37JOiJDI0K: {
    list: getHighlightsNos('50+', '3', '3'),
  },
  FnsHdtMjq1a7j7: {
    list: getHighlightsNos('150+', '3', '3'),
  },
  FhZlzY1EMcTImZ: {
    list: getHighlightsNos('300+', '3', '3'),
  },
  FFsK7Ojsv5B8cb: {
    list: getHighlightsNos('400+', '4', '4'),
  },
  CDa7YMwXiWqCZz: {
    list: getHighlightsNos('600+', '20', '20'),
  },
  GUHRJkzqlJHB95: {
    list: getHighlightsNos('2000+', '9', '8'),
  },
  CQb8Hvj0vXJHqR: {
    list: getHighlightsNos('2000+', '10 months', '9 months'),
  },
  '10000000000000': {
    list: getHighlightsNos('2000+', '9', '8'),
  },
};

function getHighlightsNos(customersNo, securedTime, noFraudTime) {
  return {
    customersNo,
    securedTime,
    noFraudTime,
  };
}

export default badges_text;
