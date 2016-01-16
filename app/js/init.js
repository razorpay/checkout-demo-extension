var roll = function(){};
var noop = roll;

var err = function(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
};

var ua = navigator.userAgent;
var isCriOS = /\(iP.+(Cr|Fx)iOS/.test(ua);
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  if(typeof this.configure === 'function'){
    this.configure(options);
  }
  return this;
};

Razorpay.defaults = {
  'protocol': 'https',
  'hostname': 'api.razorpay.com',
  'version': 'v1',
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
  'display_amount': '',

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
    'color': '#00BCD4',
    'imagePadding': 12
  },
  'signature': '',
  'name': '', // of merchant
  'image': ''
};