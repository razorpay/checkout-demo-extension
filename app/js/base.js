
function raise(message){
  throw new Error(message);
}

var discreet = {
  lib: 'checkoutjs',
  shouldAjax: function(data){
    return discreet.isFrame && data.wallet === 'mobikwik'
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
        track('unsupported', {message: alertMessage, ua: ua});
        alert(alertMessage + ' choose another browser.');
      }
      return false;
    }
    return true;
  },

  medium: 'web',
  context: location.href.replace(/^https?:\/\//,''),
  setCommunicator: noop,

  isBase64Image: function(image){
    return /data:image\/[^;]+;base64/.test(image);
  },

  defaultError: function(){
    return {error:{description:'Payment cancelled'}};
  },

  makeUrl: function(unversioned){
    var url = RazorpayConfig.protocol + '://' + RazorpayConfig.hostname + '/';
    if(!unversioned){
      url += RazorpayConfig.version;
    }
    return url;
  },

  nextRequestRedirect: function(data){
    if(window !== window.parent){
      return invoke(Razorpay.sendMessage, null, {event: 'redirect', data: data});
    }
    submitForm(data.url, data.content, data.method);
  },

  setNotes: function(options, overrides){
    each(overrides.notes, function(key, val){
      var valType = typeof val;
      if ( valType === 'string' || valType === 'number' || valType === 'boolean' ) {
        if(!('notes' in options)){
          options.notes = {};
        }
        options.notes[key] = val;
      }
    })
  }
}

function base_set(baseval, override) {
  if ( typeof baseval === 'object' ) {
    if( !baseval ){
      return typeof override === 'boolean' ? override : baseval;
    }

    if( !override || typeof override !== 'object' ){
      override = {};
    }

    if(baseval instanceof Array && override instanceof Array){
      return override;
    }

    return map(
      baseval,
      function(val, i){
        return base_set( val, override[i] );
      }
    )
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

    if (!intAmount || typeof intAmount !== 'number' || intAmount < 100 || /\./.test(strAmount)) {
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
      return 'Only USD is supported';
    }
  },

  display_amount: function(amount){
    amount = String(amount).replace(/([^0-9\. ])/g,'');
    if(!amount && amount !== Razorpay.defaults.display_amount){
      return '';
    }
  },

  parent: function(parent){
    if(!(parent && parent.nodeName || typeof parent === 'string' || parent === Razorpay.defaults.parent)){
      return 'Invalid parent';
    }
  }
}

function validateRequiredFields(options){
  each(
    ['key', 'amount'],
    function(index, key){
      if(!options[key]){
        raise('No ' + key + ' passed.');
      }
    }
  )
}

function validateOverrides(options) {
  var errorMessage;

  each(
    options,
    function(i, option){
      errorMessage = invoke(
        optionValidations[i],
        null,
        option
      )
      if(typeof errorMessage === 'string'){
        raise('Invalid ' + i + ' (' + errorMessage + ')');
      }
    }
  )
}

function base_configure(overrides){
  if( !overrides || typeof overrides !== 'object' ) {
    raise('Invalid options');
  }

  validateOverrides(overrides);

  var options = base_set( Razorpay.defaults, overrides );

  try{
    var backdropClose = overrides.modal.backdropClose;
    if(typeof backdropClose === 'boolean'){
      options.modal.backdropclose = backdropClose;
    }
  }
  catch(e){}

  discreet.setNotes(options, overrides);

  if( typeof overrides.redirect === 'boolean' ) {
    var redirectValue = overrides.redirect;
    options.redirect = function(){return redirectValue};
  }

  if(overrides.parent){
    options.parent = overrides.parent;
  }

  discreet.setCommunicator(options);
  return options;
}

Razorpay.prototype.configure = function(overrides){
  var key, options;
  try{
    options = this.options = base_configure(overrides);
    key = options.key;
    validateRequiredFields(options);
  } catch(e){
    var message = e.message;
    if(!/^rzp_l/.test(key || overrides.key || '')){
      alert(message);
    }
    raise(message);
  }

  if(this instanceof Razorpay){
    this.id = generateUID();
    this.modal = {options: {}};
    if(!discreet.isFrame){
      track.call( this, 'init' );
    }

    if(options.parent){
      this.open();
    }
  }
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = base_configure(overrides);
}
