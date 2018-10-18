var Razorpay = window.Razorpay;
var templates = {};

var RazorpayConfig = discreet.RazorpayConfig;
var makeAuthUrl = discreet.makeAuthUrl;
var makePrefParams = discreet.makePrefParams;
var fetch = discreet.fetch;
var Track = discreet.Track;
var Analytics = discreet.Analytics;
var AnalyticsTypes = discreet.AnalyticsTypes;
var UPIUtils = discreet.UPIUtils;
var Tez = discreet.Tez;
var Color = discreet.Color;
var Confirm = discreet.Confirm;
var Callout = discreet.Callout;
var getDecimalAmount = discreet.getDecimalAmount;
var _PaymentMethodIcons = discreet._PaymentMethodIcons;
var ua_android_browser = discreet.androidBrowser;
var Constants = discreet.Constants;
var Bank = discreet.Bank;
var Wallet = discreet.Wallet;
var SessionManager = discreet.SessionManager;
var Checkout = discreet.Checkout;
var Bridge = discreet.Bridge;
var Curtain = discreet.Curtain;

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  if (isString(url) && url.indexOf('https://checkout.razorpay.com')) {
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
