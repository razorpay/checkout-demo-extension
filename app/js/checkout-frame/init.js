// flag for checkout-frame.js
discreet.isFrame = true;
trackingProps.library = 'checkoutjs';

(function() {
  var a = document.createElement('a');
  a.href = RazorpayConfig.frameApi;
  var href = a.href;
  if (href.slice(-1) !== '/') {
    href += '/';
  }
  RazorpayConfig.api = href;
})();

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  track(getSession().r, 'js_error', {
    message: errorMsg,
    line: lineNumber,
    col: column,
    stack: errorObj && errorObj.stack
  });
};
