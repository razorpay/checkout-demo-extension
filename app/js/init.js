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

var Razorpay = window.Razorpay = function(overrides){
  if(!(this instanceof Razorpay)){
    return new Razorpay(overrides);
  }
  Eventer.call(this);
  this.id = generateUID();

  try {
    this.get = base_configure(overrides).get;
  } catch(e) {
    var message = e.message;
    if (!this.get || !this.isLiveMode()) {
      alert(message);
    }
    raise(message);
  }

  if (!this.get('key')) {
    raise('No key passed');
  }
  discreet.validate(this);

  // init for checkoutjs is tracked from iframe
  // we've open event to track parent side of options
  if (!discreet.isCheckout) {
    track(this, 'init');
  }

  this.postInit();
};

var RazorProto = Razorpay.prototype = new Eventer();

var RazorpayDefaults = Razorpay.defaults = {
  'key': '',
  'amount': 0,
  'currency': 'INR',
  'order_id': '',
  'notes': null,
  'callback_url': '',
  'redirect': false,
  'description': '',
  'customer_id': '',
  'signature': ''
};

function base_configure(overrides) {
  if( !overrides || typeof overrides !== 'object' ) {
    raise('Invalid options');
  }

  var options = Options(overrides);
  validateOverrides(options);
  setNotes(options);

  var callback_url = options.get('callback_url');
  if (callback_url && ua_prefer_redirect) {
    options.set('redirect', true);
  }

  return options;
}

function setNotes(options){
  var notes = options.get('notes');
  each(notes, function(key, val){
    var valType = typeof val;
    if (!(valType === 'string' || valType === 'number' || valType === 'boolean')){
      delete notes[key];
    }
  })
}

RazorProto.isLiveMode = function() {
  return /^rzp_l/.test(this.get('key'));
}

function isValidAmount(amt){
  if (/[^0-9]/.test(amt)){
    return false;
  }
  amt = parseInt(amt, 10);

  return amt >= 100;
}

function makePrefParams(rzp) {
  if (rzp) {
    var getter = rzp.get;
    var params = {};
    params.key_id = getter('key');

    var order_id = getter('order_id');
    var customer_id = getter('customer_id');

    if (order_id) {
      params.order_id = order_id;
    }
    if (customer_id) {
      params.customer_id = customer_id;
    }
    return params;
  }
}

var discreet = {
  validate: noop,

  msg: {
    wrongotp: 'Entered OTP was incorrect. Re-enter to proceed.'
  },

  supported: function(showAlert) {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
    var alertMessage;

    if(isIOS){
      if(/CriOS/.test(ua)){
        if(!window.indexedDB){
          alertMessage = 'Please update your Chrome browser or';
        }
      }
      else if(/FxiOS|UCBrowser/.test(ua)){
        alertMessage = 'This browser is unsupported. Please';
      }
    }
    else if (/Opera Mini\//.test(ua)) {
      alertMessage = 'Opera Mini is unsupported. Please';
    }

    if(alertMessage){
      if(showAlert){
        // TODO track
        alert(alertMessage + ' choose another browser.');
      }
      return false;
    }
    return true;
  },

  isBase64Image: function(image) {
    return /data:image\/[^;]+;base64/.test(image);
  },

  cancelMsg: 'Payment cancelled',

  error: function(message) {
    return {
      error:{
        description: message || discreet.cancelMsg
      }
    };
  },

  redirect: function(data) {
    if(window !== window.parent){
      return invoke(Razorpay.sendMessage, null, {event: 'redirect', data: data});
    }
    submitForm(data.url, data.content, data.method);
  }
}

var optionValidations = {
  notes: function(notes) {
    var errorMessage = '';
    if (isNonNullObject(notes)) {
      var notesCount = 0;
      each(notes, function() {
        notesCount++;
      })
      if(notesCount > 15) { errorMessage = 'At most 15 notes are allowed' }
      else { return }
    }
    return errorMessage;
  }
}

function validateOverrides(options) {
  var errorMessage;
  options = options.get();
  each(
    optionValidations,
    function(key, validation){
      if (key in options) {
        errorMessage = validation(options[key]);
      }
      if (isString(errorMessage)) {
        raise('Invalid ' + key + ' (' + errorMessage + ')');
      }
    }
  )
}

Razorpay.configure = function(overrides){
  each(
    flatten(overrides, Razorpay.defaults),
    function(key, val){
      var defaultValue = Razorpay.defaults[key];
      if(typeof defaultValue === typeof val){
        Razorpay.defaults[key] = val;
      }
    }
  )
}