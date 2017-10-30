function err(errors) {
  if (errors instanceof Array && !errors.length) {
    return false;
  }
  return true;
}

var body;

function setBody() {
  body = document.body || document.getElementsByTagName('body')[0];
  if (!body) {
    setTimeout(setBody, 99);
  }
}
setBody();
var doc = body || document.documentElement;

function needBody(func) {
  return function bodyInsurance() {
    if (!body) {
      defer(bind(bodyInsurance, this), 99);
      return this;
    }
    return func.call(this);
  };
}

var RazorpayConfig = {
  api: 'https://api.razorpay.com/',
  version: 'v1/',
  frameApi: '/',
  cdn: 'https://cdn.razorpay.com/'
};

try {
  var config = window.Razorpay.config;
  for (var i in config) {
    RazorpayConfig[i] = config[i];
  }
} catch (e) {}

function makeUrl(path) {
  if (!path) {
    path = '';
  }
  return RazorpayConfig.api + RazorpayConfig.version + path;
}

function makeAuthUrl(key, path) {
  if (typeof key !== 'string') {
    key = key.get('key');
  }
  return makeUrl(path) + '?key_id=' + key;
}

var Razorpay = (window.Razorpay = function(overrides) {
  if (!(this instanceof Razorpay)) {
    return new Razorpay(overrides);
  }
  Eventer.call(this);
  this.id = generateUID();

  try {
    var options = base_configure(overrides);
    this.get = options.get;
    this.set = options.set;
  } catch (e) {
    var message = e.message;
    if (!this.get || !this.isLiveMode()) {
      if (isNonNullObject(overrides) && !overrides.parent) {
        alert(message);
      }
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
});

var RazorProto = (Razorpay.prototype = new Eventer());

RazorProto.postInit = noop;

RazorProto.onNew = function(event, callback) {
  if (event === 'ready') {
    var self = this;
    if (self.prefs) {
      callback(event, self.prefs);
    } else {
      getPrefsJsonp(makePrefParams(self), function(response) {
        if (response.methods) {
          self.prefs = response;
          self.methods = response.methods;
        }
        callback(self.prefs);
      });
    }
  }
};

RazorProto.emi_calculator = function(length, rate) {
  return Razorpay.emi.calculator(this.get('amount') / 100, length, rate);
};

Razorpay.emi = {
  calculator: function(principle, length, rate) {
    if (!rate) {
      return Math.ceil(principle / length);
    }
    rate /= 1200;
    var multiplier = Math.pow(1 + rate, length);
    return parseInt(principle * rate * multiplier / (multiplier - 1), 10);
  }
};

function getPrefsJsonp(data, callback) {
  return $.jsonp({
    url: makeUrl('preferences'),
    data: data,
    timeout: 30000,
    success: function(response) {
      invoke(callback, null, response);
    }
  });
}

var razorpayPayment = (Razorpay.payment = {
  getMethods: function(callback) {
    return getPrefsJsonp(
      {
        key_id: Razorpay.defaults.key
      },
      function(response) {
        callback(response.methods || response);
      }
    );
  }
});

var RazorpayDefaults = (Razorpay.defaults = {
  key: '',
  image: '',
  amount: 100,
  currency: 'INR',
  order_id: '',
  invoice_id: '',
  subscription_id: '',
  notes: null,
  callback_url: '',
  redirect: false,
  description: '',
  customer_id: '',
  recurring: null,
  signature: '',
  retry: true,
  target: '',
  subscription_card_change: null,
  display_currency: '',
  display_amount: ''
});

function base_configure(overrides) {
  if (!overrides || typeof overrides !== 'object') {
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

function setNotes(options) {
  var notes = options.get('notes');
  each(notes, function(key, val) {
    if (isString(val)) {
      if (val.length > 254) {
        notes[key] = val.slice(0, 254);
      }
    } else if (!(isNumber(val) || isBoolean(val))) {
      delete notes[key];
    }
  });
}

RazorProto.isLiveMode = function() {
  return /^rzp_l/.test(this.get('key'));
};

function isValidAmount(amt) {
  if (/[^0-9]/.test(amt)) {
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

    each(
      [
        'order_id',
        'customer_id',
        'invoice_id',
        'subscription_id',
        'recurring',
        'subscription_card_change'
      ],
      function(i, key) {
        var value = getter(key);
        if (value) {
          params[key] = value;
        }
      }
    );

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

    if (isIOS) {
      if (/CriOS/.test(ua)) {
        if (!window.indexedDB) {
          alertMessage = 'Please update your Chrome browser or';
        }
      } else if (/FxiOS|UCBrowser/.test(ua)) {
        alertMessage = 'This browser is unsupported. Please';
      }
    } else if (/Opera Mini\//.test(ua)) {
      alertMessage = 'Opera Mini is unsupported. Please';
    }

    if (alertMessage) {
      if (showAlert) {
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
      error: {
        description: message || discreet.cancelMsg
      }
    };
  },

  redirect: function(data) {
    if (!data.target && window !== window.parent) {
      return invoke(Razorpay.sendMessage, null, {
        event: 'redirect',
        data: data
      });
    }
    submitForm(data.url, data.content, data.method, data.target);
  },

  currencies: {
    USD: '$',
    AUD: 'A$',
    CAD: 'C$',
    HKD: 'HK$',
    NZD: 'NZ$',
    SGD: 'SG$',
    CZK: 'Kč',
    NOK: 'kr',
    DKK: 'kr',
    SEK: 'kr',
    EUR: '€',
    GBP: '£',
    HUF: 'Ft',
    JPY: '¥',
    CNY: '¥',
    AED: 'د.إ',
    PLN: 'zł',
    SFR: 'Fr',
    CHF: 'Fr'
  }
};

var optionValidations = {
  notes: function(notes) {
    var errorMessage = '';
    if (isNonNullObject(notes)) {
      var notesCount = 0;
      each(notes, function() {
        notesCount++;
      });
      if (notesCount > 15) {
        errorMessage = 'At most 15 notes are allowed';
      } else {
        return;
      }
    }
    return errorMessage;
  },

  amount: function(amount) {
    if (!isValidAmount(amount)) {
      var errorMessage =
        'should be passed in integer paise. Minimum value is 100 paise, i.e. ₹ 1';
      return errorMessage;
    }
  },

  currency: function(currency) {
    if (currency !== 'INR' && currency !== 'USD') {
      return 'INR and USD are the only supported values for currency field.';
    }
  },

  display_currency: function(currency) {
    if (
      !(currency in discreet.currencies) &&
      currency !== Razorpay.defaults.display_currency
    ) {
      return 'This display currency is not supported';
    }
  },

  display_amount: function(amount) {
    amount = String(amount).replace(/([^0-9\.])/g, '');
    if (!amount && amount !== Razorpay.defaults.display_amount) {
      return '';
    }
  }
};

function validateOverrides(options) {
  var errorMessage;
  options = options.get();
  each(optionValidations, function(key, validation) {
    if (key in options) {
      errorMessage = validation(options[key]);
    }
    if (isString(errorMessage)) {
      raise('Invalid ' + key + ' (' + errorMessage + ')');
    }
  });
}

Razorpay.configure = function(overrides) {
  each(flatten(overrides, Razorpay.defaults), function(key, val) {
    var defaultValue = Razorpay.defaults[key];
    if (typeof defaultValue === typeof val) {
      Razorpay.defaults[key] = val;
    }
  });
};
