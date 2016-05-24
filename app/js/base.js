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

  medium: 'web',
  context: location.href.replace(/^https?:\/\//,''),

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
    if (!isValidAmount(amount)) {
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
      if(typeof errorMessage === 'string'){
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

  if(overrides.parent){
    options.set('parent', overrides.parent);
  }

  return options;
}

function addListener(rzp, event, listener){
  if(!(event in rzp._events)){
    rzp._events[event] = listener;
  }
}

Razorpay.prototype = {
  on: function(event, callback, namespace){
    if(typeof callback !== 'function'){
      return;
    }
    var events = this._events;
    if(namespace){
      if(!(namespace in events)){
        events[namespace] = {};
      }
      events = events[namespace];
    } else {
      var eventSplit = event.split('.');
      if (eventSplit.length > 1){
        return this.on(eventSplit[1], callback, eventSplit[0]);
      }
    }
    var eventMap = events[event];
    if (!(eventMap instanceof Array)) {
      eventMap = events[event] = [];
    }
    eventMap.push(callback);
    return this;
  },

  once: function(event, callback){
    return this.on(
      event,
      bind(
        function(arg){
          this.off(event, callback);
          callback(arg);
        },
        this
      )
    )
  },

  off: function(event, callback){
    var argLen = arguments.length;
    if(argLen === 1){
      delete this._events[event]
    } else if (!argLen) {
      this._events = {};
    } else {
      var eventSplit = event.split('.');
      var eventMap = this._events[eventSplit[0]];
      if (eventSplit.length > 1){
        eventMap = eventMap[eventSplit[1]];
      }
      eventMap.splice(indexOf(eventMap, callback), 1);
    }
    return this;
  },

  emit: function(event, arg){
    var eventSplit = event.split('.');
    var eventMap = this._events[eventSplit[0]];
    if (eventMap && eventSplit.length > 1) {
      eventMap = eventMap[eventSplit[1]];
    }
    if(eventMap){
      if(eventMap instanceof Array){
        // .on('event') based callback
        each(eventMap, function(i, listener){
          listener(arg);
        })
      } else {
        // onEvent based callback
        eventMap(arg);
      }      
    }
    return this;
  },

  emitter: function(event, args){
    return bind(function(){ this.emit(event, args) }, this);
  },

  isLiveMode: function(){
    return /^rzp_l/.test(this.get('key'));
  },

  configure: function(overrides){
    var key, options;
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

    if(this instanceof Razorpay){
      this.id = generateUID();
      this.modal = {options: emo};
      this.options = emo;
      if(this.get('parent') && this.open){
        this.open();
      }
    }
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