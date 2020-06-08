var Razorpay = window.Razorpay;
var templates = {};

var RazorpayConfig = discreet.RazorpayConfig;
var fetch = discreet.fetch;
var Track = discreet.Track;
var Analytics = discreet.Analytics;
var AnalyticsTypes = discreet.AnalyticsTypes;
var UPIUtils = discreet.UPIUtils;
var GPay = discreet.GPay;
var Color = discreet.Color;
var Confirm = discreet.Confirm;
var _PaymentMethodIcons = discreet._PaymentMethodIcons;
var Constants = discreet.Constants;
var Bank = discreet.Bank;
var Wallet = discreet.Wallet;
var CardlessEmi = discreet.CardlessEmi;
var Token = discreet.Token;
var SessionManager = discreet.SessionManager;
var Checkout = discreet.Checkout;
var Bridge = discreet.Bridge;
var Curtain = discreet.Curtain;
var P13n = discreet.P13n;
var Store = discreet.Store;
var _Str = discreet._Str;
var _Arr = discreet._Arr;

var ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://prod-checkout-canary.razorpay.com',
];

function isUrlApplicableForErrorTracking(url) {
  return _Arr.any(ERROR_TRACKING_URLS, function(availableUrl) {
    return _Str.startsWith(url, availableUrl);
  });
}

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  if (isString(url) && !isUrlApplicableForErrorTracking(url)) {
    return;
  }

  Analytics.track('js_error', {
    r: SessionManager.getSession().r,
    data: {
      message: errorMsg,
      line: lineNumber,
      col: column,
      stack: errorObj && errorObj.stack,
    },
    immediately: true,
  });
};
