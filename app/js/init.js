var roll = function(){};
var noop = roll;

var err = function(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
};

var doc = document.body || document.documentElement;
var ua = navigator.userAgent;
var isCriOS = /\(iP.+(Cr|Fx)iOS/.test(ua);
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  invoke(this.configure, this, options);
};

var RazorpayConfig = {
  protocol: 'https',
  hostname: 'api.razorpay.com',
  version: 'v1/'
}

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
    'backdropColor': 'rgba(0,0,0,0.6)',
    'imageFrame': true
  },
  'signature': '',
  'name': '', // of merchant
  'image': ''
};