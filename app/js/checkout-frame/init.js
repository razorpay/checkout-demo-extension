var Razorpay = window.Razorpay;
var templates = {};

var RazorpayConfig = discreet.RazorpayConfig;
var makeAuthUrl = discreet.makeAuthUrl;
var makePrefParams = discreet.makePrefParams;
var fetch = discreet.fetch;
var Track = discreet.Track;
var UPIUtils = discreet.UPIUtils;
var Tez = discreet.Tez;
var Color = discreet.Color;
var Confirm = discreet.Confirm;
var Callout = discreet.Callout;
var getDecimalAmount = discreet.getDecimalAmount;
var _PaymentMethodIcons = discreet._PaymentMethodIcons;
var ua_android_browser = discreet.androidBrowser;
var Curtain = discreet.Curtain;

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  if (isString(url) && url.indexOf('https://checkout.razorpay.com')) {
    return;
  }

  Track(getSession().r, 'js_error', {
    message: errorMsg,
    line: lineNumber,
    col: column,
    stack: errorObj && errorObj.stack,
  });
};
