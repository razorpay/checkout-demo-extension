Razorpay = function(options){
  if(typeof this.configure == 'function'){
    this.configure(options);
  }
  return this;
};

(function(){
  var r = Razorpay;
  if(window.Rollbar) r.roll = window.roll;
  r.prototype = {};
  r.card = {};
  r.discreet = {
    
    currentScript: document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })(),

    merchantData: {}
  };
  r.noop = function(){};
  r.defaults = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    methodsUrl: '/methods',
    key: '',
    amount: '',
    currency: 'INR',
    handler: r.noop,
    notes: {},
    callback_url: '',
    redirect: false,
    description: '',

    // automatic checkout only
    buttontext: 'Pay Now',

    // checkout fields, not needed for razorpay alone
    display_currency: '',

    method: {
      netbanking: null,
      card: null,
      wallet: {}
    },
    prefill: {
      name: '',
      contact: '',
      email: '',
      card: {
        number: '',
        expiry_month: '',
        expiry_year: ''
      }
    },
    modal: {
      ondismiss: r.noop,
      onhidden: r.noop,
      escape: true,
      animation: true,
      backdropClose: true
    },
    signature: '',
    display_amount: '',
    name: '', // of merchant
    image: ''
  };
})();