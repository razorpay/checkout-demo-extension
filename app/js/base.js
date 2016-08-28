function setNotes(options){
  var notes = options.get('notes');
  each(notes, function(key, val){
    var valType = typeof val;
    if (!(valType === 'string' || valType === 'number' || valType === 'boolean')){
      delete notes[key];
    }
  })
}

function raise(message){
  throw new Error(message);
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
  currencies: {
    'USD': '$',
    'AUD': 'A$',
    'CAD': 'C$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'SGD': 'SG$',
    'CZK': 'Kč',
    'NOK': 'kr',
    'DKK': 'kr',
    'SEK': 'kr',
    'EUR': '€',
    'GBP': '£',
    'HUF': 'Ft',
    'JPY': '¥',
    'PLN': 'zł',
    'SFR': 'Fr',
    'CHF': 'Fr'
  },

  msg: {
    wrongotp: 'Entered OTP was incorrect. Re-enter to proceed.'
  },

  supported: function(showAlert){
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

  isBase64Image: function(image){
    return /data:image\/[^;]+;base64/.test(image);
  },

  cancelMsg: 'Payment cancelled',

  error: function(message){
    return {
      error:{
        description: message || discreet.cancelMsg
      }
    };
  },

  redirect: function(data){
    if(window !== window.parent){
      return invoke(Razorpay.sendMessage, null, {event: 'redirect', data: data});
    }
    submitForm(data.url, data.content, data.method);
  }
}

var optionValidations = {
  key: function(key){
    if(!key){
      return '';
    }
  },

  notes: function(notes){
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
  },

  amount: function(amount){
    if (!isValidAmount(amount)) {
      var errorMessage = 'should be passed in integer paise. Minimum value is 100 paise, i.e. ₹ 1';
      alert('Invalid amount. It ' + errorMessage);
      return errorMessage;
    }
  },

  currency: function(currency){
    if(currency !== 'INR'){
      return 'INR is the only supported value.';
    }
  },

  display_currency: function(currency){
    if(!(currency in discreet.currencies) && currency !== Razorpay.defaults.display_currency){
      return 'This dislpay currency is not supported';
    }
  },

  display_amount: function(amount){
    amount = String(amount).replace(/([^0-9\.])/g,'');
    if(!amount && amount !== Razorpay.defaults.display_amount){
      return '';
    }
  },

  parent: function(parent){
    if (!$(parent)[0]) {
      return 'The parent element provided for the ' +
        'embedded checkout doesn\'t exist';
    }
  }
}

function validateRequiredFields(rzp){
  each(
    ['key', 'amount'],
    function(index, key){
      if(!rzp.get(key)){
        raise('No ' + key + ' passed.');
      }
    }
  )
}

function validateOverrides(options) {
  var errorMessage;
  options = options.get();
  each(
    options,
    function(key, val){
      if(key in optionValidations){
        errorMessage = optionValidations[key](val);
      }
      if (isString(errorMessage)) {
        raise('Invalid ' + key + ' (' + errorMessage + ')');
      }
    }
  )
}

function base_configure(overrides){
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

function addListener(rzp, event, listener){
  if(!(event in rzp._events)){
    rzp._events[event] = listener;
  }
}

RazorProto.isLiveMode = function() {
  return /^rzp_l/.test(this.get('key'));
}

RazorProto.configure = function(overrides) {
  var key;
  try{
    this.get = base_configure(overrides).get;
    key = this.get('key');
    validateRequiredFields(this);
  } catch(e){
    var message = e.message;
    if(!this.get || !this.isLiveMode()){
      alert(message);
    }
    raise(message);
  }
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