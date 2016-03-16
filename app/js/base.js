function base_set(flatObj, objKey, objVal){
  objKey = objKey.toLowerCase();
  var defaultVal = Razorpay.defaults[objKey];
  if(typeof objVal === 'number'){
    objVal = String(objVal);
  }
  if(typeof defaultVal === typeof objVal){
    flatObj[objKey] = objVal;
  }
}

function flatten(obj){
  var flatObj = {};
  each(
    obj,
    function(objKey, objVal){
      if(objKey in flatKeys){
        each(
          objVal,
          function(objSubKey, objSubVal){
            base_set(flatObj, objKey + '.' + objSubKey, objSubVal);
          }
        )
      } else {
        base_set(flatObj, objKey, objVal);
      }
    }
  )
  return flatObj;
}

function setNotes(options, notesObj){
  if(!notesObj){
    notesObj = options.notes;
  } else {
    options.notes = {};
  }
  each(notesObj, function(key, val){
    var valType = typeof val;
    if ( valType === 'string' || valType === 'number' || valType === 'boolean' ) {
      options.notes[key] = val;
    }
  })
}

flatKeys = {};
each(
  Razorpay.defaults,
  function(key, val){
    if(key !== 'notes' && val && typeof val === 'object'){
      flatKeys[key] = true;
      each(
        val,
        function(subKey, subVal){
          Razorpay.defaults[key + '.' + subKey] = subVal;
        }
      )
      delete Razorpay.defaults[key];
    }
  }
)

function raise(message){
  throw new Error(message);
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
    'SFR': 'Fr'
  },
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
  var options = flatten(overrides);
  setNotes(options);

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

Razorpay.prototype.get = function(key){
  return key in this.options ? this.options[key] : Razorpay.defaults[key];
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

    if(this.get('parent')){
      this.open();
    }
  }
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = base_configure(overrides);
}