Razorpay = function(options){
  if(typeof this.configure == 'function'){
    this.configure(options);
  }
  return this;
};

(function(){
  Razorpay.card = {};
  Razorpay.prototype.discreet = {
    
    currentScript: document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })(),

    merchantData: {}
  }
})();