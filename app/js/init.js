var roll = function(){};
var noop = roll;
var emo = {};

function err(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
}

var body;

function setBody(){
  body = document.body || document.getElementsByTagName('body')[0];
  if (!body) {
    setTimeout(setBody, 99);
  }
}
setBody();
var doc = body || document.documentElement;

function needBody(func){
  return function bodyInsurance(){
    if (!body) {
      defer(bind(bodyInsurance, this), 99);
      return this;
    }
    return func.call(this);
  }
}

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
  this.configure(options);
};

Razorpay.defaults = {
  'key': '',
  'amount': 0,
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
  'remember_customer': false,
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
    'card[expiry]': '',
    'card[cvv]': ''
  },
  'modal': {
    'confirm_close': false,
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
    'color': '',
    'backdrop_color': 'rgba(0,0,0,0.6)',
    'image_padding': true,
    'close_button': true,
    'header': true
  },
  'customer_id': '',
  'signature': '',
  'name': '', // of merchant
  'image': ''
};
