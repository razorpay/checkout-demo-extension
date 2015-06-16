window.Razorpay = function(options){
  if(typeof this.configure == 'function'){
    this.configure(options);
  }
  return this;
};
(function(){
  var currentScript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })()
  Razorpay.prototype.discreet = {
    currentScript: currentScript,
    merchantData: {}
  }
})();
