var roll = function(){};
var noop = roll;
var ua = navigator.userAgent;

function _toBase64(number){
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 64
    result = _base64_chars[rixit] + result;
    number = Math.floor(number / 64);
  }
  return result;
}

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  if(typeof this.configure === 'function'){
    this.configure(options);
  }
  this._id = _toBase64(
    new Date().getTime() + ('000' + parseInt(4096*Math.random())).slice(-4)
  );
  return this;
};

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