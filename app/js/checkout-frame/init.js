// flag for checkout-frame.js
discreet.isFrame = true;

(function(){
  var a = document.createElement('a');
  a.href = RazorpayConfig.frameApi;
  RazorpayConfig.api = a.href;
})();
