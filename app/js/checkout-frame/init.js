// flag for checkout-frame.js
discreet.isFrame = true;

(function(){
  var a = document.createElement('a');
  a.href = RazorpayConfig.frameApi;
  var href = a.href;
  if (href.slice(-1) !== '/') {
    href += '/';
  }
  RazorpayConfig.api = href;
})();
