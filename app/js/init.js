var roll = function(){};
var noop = roll;
var emo = {};

function err(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
}

var doc = document.body || document.getElementsByTagName('body')[0] || document.documentElement;
var docEl = doc.documentElement;
var body;

function setBody(){
  body = document.body;
  if (!body) {
    setTimeout(setBody, 99);
  }
}

function needBody(func){
  return function bodyInsurance(){
    var self = this;
    if (!body) {
      return setTimeout(function(){
        func.apply(self, arguments);
      }, 99);
    }
    func.apply(self, arguments);
  }
}

var ua = navigator.userAgent;
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var RazorpayConfig = {
  api: 'https://api.razorpay.com/',
  version: 'v1/',
  frameApi: '/',
  cdn: 'https://cdn.razorpay.com/'
}

try {
  var config = window.Razorpay.config;
  for (var i in config) {
    RazorpayConfig[i] = config[i];
  }
} catch(e){}

function makeUrl(path){
  if (!path) {
    path = '';
  }
  return RazorpayConfig.api + RazorpayConfig.version + path;
}

function makeAuthUrl(key, path){
  if (typeof key !== 'string') {
    key = key.get('key');
  }
  return makeUrl(path) + '?key_id=' + key;
}

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  this._events = {};
  invoke(this.configure, this, options);
};

Razorpay.defaults = {
  'key': '',
  'amount': '',
  'currency': 'INR',
  'order_id': '',
  'handler': function(data){
    if (this instanceof Razorpay) {
      var callback_url = this.get('callback_url');
      if(callback_url){
        submitForm(callback_url, data, 'post');
      }
    }
  },
  'notes': null,
  'callback_url': '',

  'redirect': false,
  'description': '',

  // automatic checkout only
  'buttontext': 'Pay Now',

  // checkout fields, not needed for razorpay alone
  'parent': null,
  'display_currency': '',
  'display_amount': '',
  'cardsaving': false,
  'method': {
    'netbanking': true,
    'card': true,
    'wallet': null,
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
    'color': '#3594E2',
    'backdrop_color': 'rgba(0,0,0,0.6)',
    'image_padding': true,
    'close_button': true
  },
  'customer_id': '',
  'signature': '',
  'name': '', // of merchant
  'image': ''
};
