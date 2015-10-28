var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

var roll = noop = function(){};
var ua = navigator.userAgent;

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  if(typeof this.configure == 'function'){
    this.configure(options);
  }
  return this;
};

var discreet = Razorpay.discreet = {};
Razorpay.defaults = {
  'protocol': 'https',
  'hostname': 'api.razorpay.com',
  'version': 'v1',
  'jsonpUrl': '/payments/create/jsonp',
  'methodsUrl': '/methods',
  'key': '',
  'amount': '',
  'currency': 'INR',
  'handler': noop,
  'notes': {},
  'callback_url': '',
  'redirect': false,
  'description': '',

  // automatic checkout only
  'buttontext': 'Pay Now',

  // checkout fields, not needed for razorpay alone
  'display_currency': '',

  'method': {
    'netbanking': null,
    'card': null,
    'wallet': {}
  },
  'prefill': {
    'name': '',
    'contact': '',
    'email': '',
    'card': {
      'number': '',
      'expiry_month': '',
      'expiry_year': ''
    }
  },
  'modal': {
    'ondismiss': noop,
    'onhidden': noop,
    'escape': true,
    'animation': true,
    'backdropClose': false
  },
  'theme': {
    'color': '#00BCD4'
  },
  'signature': '',
  'display_amount': '',
  'name': '', // of merchant
  'image': ''
};