var Razorpay = window.Razorpay;
var templates = {};

var RazorpayConfig = discreet.RazorpayConfig;
var fetch = discreet.fetch;
var Track = discreet.Track;
var Analytics = discreet.Analytics;
var AnalyticsTypes = discreet.AnalyticsTypes;
var ErrorService = discreet.ErrorService;
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
var _Arr = discreet._Arr;

var ERROR_TRACKING_URLS = [
  'https://checkout.razorpay.com',
  'https://prod-checkout-canary.razorpay.com',
];

function isUrlApplicableForErrorTracking(url) {
  return ERROR_TRACKING_URLS.some(function (availableUrl) {
    return url.startsWith(availableUrl);
  });
}

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  if (typeof url === 'string' && !isUrlApplicableForErrorTracking(url)) {
    return;
  }
  var error = {
    message: errorMsg,
    lineNumber: lineNumber,
    fileName: url,
    columnNumber: column,
    stack: errorObj && errorObj.stack,
  };

  ErrorService.captureError(error, {
    unhandled: true,
    analytics: {
      event: 'js_error',

      // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
      data: {
        message: errorMsg,
        line: lineNumber,
        col: column,
        stack: errorObj && errorObj.stack,
      },
    },
  });
};

window.addEventListener('unhandledrejection', function (event) {
  var reason = event.reason;

  if (reason instanceof Error) {
    reason = {
      name: reason.name,
      message: reason.message,
      stack: reason.stack,
    };
  }

  ErrorService.captureError(event.reason, {
    unhandled: true,
    analytics: {
      event: 'unhandled_rejection',

      // Keeping this for historic reasons. Once we've migrated to new events system we can remove this.
      data: {
        reason: reason,
      },
    },
  });
});
