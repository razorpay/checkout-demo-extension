function roll(){};
var noop = roll;

function err(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
};

var doc = document.body || document.documentElement;
var ua = navigator.userAgent;
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var RazorpayConfig;
if(typeof window.Razorpay === 'object' && Razorpay && typeof Razorpay.config === 'object'){
  RazorpayConfig = Razorpay.config;
}
else {
  RazorpayConfig = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1/'
  }
}

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  invoke(this.configure, this, options);
};

Razorpay.defaults = {
  'key': '',
  'amount': '',
  'currency': 'INR',
  'handler': function(data){
    if(this.callback_url){
      submitForm(this.callback_url, data, 'post');
    }
  },
  'notes': {},
  'callback_url': '',
  'redirect': function(){
    return this.callback_url && /FBAN|\(iP.+((Cr|Fx)iOS|UCBrowser)/.test(ua)
  },
  'description': '',

  // automatic checkout only
  'buttontext': 'Pay Now',

  // checkout fields, not needed for razorpay alone
  'parent': null,
  'display_currency': '',
  'display_amount': '',

  'method': {
    'netbanking': null,
    'card': null,
    'wallet': null,
    'emi': null
  },
  'prefill': {
    'name': '',
    'contact': '',
    'email': '',
    'card': {
      'number': '',
      'expiry': ''
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
    'backdrop_color': 'rgba(0,0,0,0.6)',
    'image_padding': true
  },
  'signature': '',
  'name': '', // of merchant
  'image': ''
};