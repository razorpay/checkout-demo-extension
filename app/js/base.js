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
    if (!intAmount || typeof intAmount !== 'number' || intAmount < 100 || String(intAmount).indexOf('.') !== -1) {
      var errorMessage = 'should be passed in paise. Minimum value is 100';
      alert('Invalid amount. It ' + errorMessage);
      return errorMessage;
    }
  },

  display_currency: function(currency){
    if(currency !== 'USD'){
      return 'Only USD is supported'
    }
  },

  display_amount: function(amount){
    amount = String(amount).replace(/([^0-9\. ])/g,'');
    if(!amount){
      return '';
    }
  }
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
    if ( typeof val === 'string' ) {
      options.notes[key] = val;
    }
  })
  try {
    if( typeof overrides.method.wallet === 'boolean' ) {
      options.method.wallet = overrides.method.wallet;
    }
  } catch(e){}


  if(typeof overrides.key === 'string' && overrides.key.indexOf('rzp_live_')){
    _uid = null;
  }

  if(!discreet.isFrame){
    var trackingPayload = $.clone(overrides);
    trackingPayload.meta = {
      ua: ua,
      cb: !!window.CheckoutBridge,
      context: location.href,
      co: !!discreet.isCheckout
    }
    track('init', trackingPayload);
  }

  discreet.setCommunicator(options);
  return options;
}

Razorpay.prototype.configure = function(overrides){
  this.options = base_configure(overrides);
  this.modal = {options: {}};
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = base_configure(overrides);
}

var discreet = {
  setCommunicator: noop,
  makeUrl: function(options, noVersion){
    return options.protocol + '://' + options.hostname + '/' + (noVersion ? '' : options.version);
  },

  nextRequestRedirect: function(data){
    if(window !== window.parent && typeof Razorpay.sendMessage === 'function'){
      return Razorpay.sendMessage({event: 'redirect', data: data});
    }
    if(data.method === 'get'){
      location.href = data.url;
    } else if (data.method === 'post' && typeof data.content === 'object'){
      var postForm = document.createElement('form');
      var html = '';

      each( data.content, function(name, value) {
        html += '<input type="hidden" name="' + name + '" value="' + value + '">'
      })
      postForm.method='post';
      postForm.innerHTML = html;
      postForm.action = data.url;
      document.body.appendChild(postForm);
      postForm.submit();
    }
  }
}
