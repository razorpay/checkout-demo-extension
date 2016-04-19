var roll = function(){};
var noop = roll;
var emo = {};

function err(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
}

var doc = document.body || document.documentElement;
var ua = navigator.userAgent;
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var RazorpayConfig;
var global_Razorpay = window.Razorpay;
if(typeof global_Razorpay === 'object' && global_Razorpay && typeof global_Razorpay.config === 'object'){
  RazorpayConfig = global_Razorpay.config;
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
  'order_id': '',
  'handler': function(data){
    if(this.callback_url){
      submitForm(this.callback_url, data, 'post');
    }
  },
  'notes': {},
  'callback_url': '',

  'redirect': false,
  'description': '',

  // automatic checkout only
  'buttontext': 'Pay Now',

  // checkout fields, not needed for razorpay alone
  'parent': null,
  'display_currency': '',
  'display_amount': '',

  'method': {
    'netbanking': true,
    'card': true,
    'wallet': true,
    'emi': true
  },
  'prefill': {
    'method': '',
    'name': '',
    'contact': '',
    'email': '',
    'card[number]': '',
    'card[expiry]': ''
  },
  'modal': {
    'ondismiss': noop,
    'onhidden': noop,
    'escape': true,
    'animation': true,
    'backdropclose': false
  },
  'external': {
    wallets: [],
    handler: noop
  },
  'theme': {
    'color': '#00BCD4',
    'backdrop_color': 'rgba(0,0,0,0.6)',
    'image_padding': true,
    'close_button': true
  },
  'customer_id': '',
  'signature': '',
  'name': '', // of merchant
  'image': ''
};