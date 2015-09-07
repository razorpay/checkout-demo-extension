Razorpay = function(options){
  if(typeof this.configure == 'function'){
    this.configure(options);
  }
  return this;
};

(function(){
  var r = Razorpay;
  r.roll = window.roll;
  r.prototype = {};
  r.card = {};
  r.discreet = {
    
    currentScript: document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })(),

    merchantData: {}
  }
})();