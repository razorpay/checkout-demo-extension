function base_set(baseval, override) {
  if ( typeof baseval === 'object' ) {
    if( !baseval ){
      return typeof override === 'boolean' ? override : baseval;
    }

    if( !override || typeof override !== 'object' ){
      override = {};
    }
    return map( baseval, function(val, i){
      return base_set( val, override[i] );
    })
  }

  if ( typeof baseval === 'string' && typeof override !== 'undefined' ) {
    return String(override);
  }

  if ( typeof baseval === typeof override ) {
    return override;
  }

  return baseval;
}

var optionValidations = {
  key: function(key){
    if(!key){
      return '';
    }
  },

  notes: function(notes){
    var errorMessage = '';
    if(typeof notes === 'object'){
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
    var intAmount = parseInt(amount, 10);
    var strAmount = String(amount);
    var isAmountFloat = strAmount.indexOf('.') !== -1;
    if(isAmountFloat){
      roll('Invalid amount', strAmount);
    }
    if (!intAmount || typeof intAmount !== 'number' || intAmount < 100) {
      var errorMessage = 'should be passed in paise. Minimum value is 100';
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
    if(currency !== 'USD' && currency !== Razorpay.defaults.display_currency){
      return 'Only USD is supported'
    }
  },

  display_amount: function(amount){
    amount = String(amount).replace(/([^0-9\. ])/g,'');
    if(!amount && amount !== Razorpay.defaults.display_amount){
      return '';
    }
  }
}

function validateRequiredFields(options){
  each(
    ['key', 'amount'],
    function(index, key){
      if(!options[key]){
        throw new Error('No ' + key + ' passed.');
      }
    }
  )
}

function validateOverrides(options) {
  var errorMessage;

  for(var i in options){
    var validationFunc = optionValidations[i];
    if(typeof validationFunc === 'function'){
      errorMessage = validationFunc(options[i]);
      if(typeof errorMessage === 'string'){
        throw new Error('Invalid ' + i + ' (' + errorMessage + ')');
      }
    }
  }
}

function base_configure(overrides){
  if( !overrides || typeof overrides !== 'object' ) {
    throw new Error('Invalid options');
  }

  validateOverrides(overrides);

  var options = base_set( Razorpay.defaults, overrides );

  each(overrides.notes, function(key, val){
    if ( typeof val !== 'object' ) {
      options.notes[key] = val;
    }
  })
  if( typeof overrides.redirect === 'boolean' ) {
    var redirectValue = overrides.redirect;
    options.redirect = function(){return redirectValue};
  }
  try {
    if( typeof overrides.method.wallet === 'boolean' ) {
      options.method.wallet = overrides.method.wallet;
    }
  } catch(e){}


  if(typeof overrides.key === 'string' && overrides.key.indexOf('rzp_live_')){
    _uid = null;
  }

  discreet.setCommunicator(options);
  return options;
}

Razorpay.prototype.configure = function(overrides){
  this.options = base_configure.call(this, overrides);
  validateRequiredFields(this.options);
  this.modal = {options: {}};

  var trackingPayload = $.clone(overrides);
  track( 'init', trackingPayload );
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = base_configure(overrides);
}

var discreet = {
  context: location.href,
  setCommunicator: noop,
  makeUrl: function(options, noVersion){
    return options.protocol + '://' + options.hostname + '/' + (noVersion ? '' : options.version);
  },

  nextRequestRedirect: function(data){
    if(window !== window.parent && typeof Razorpay.sendMessage === 'function'){
      return Razorpay.sendMessage({event: 'redirect', data: data});
    }
    submitForm(data.url, data.content, data.method);
  }
}
