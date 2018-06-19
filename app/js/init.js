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

var ba_keys = [
  'key',
  'order_id',
  'invoice_id',
  'subscription_id',
  'payment_link_id'
];

function makeAuthUrl(r, url) {
  url = makeUrl(url);

  for (var i = 0; i < ba_keys.length; i++) {
    var prop = ba_keys[i];
    var value = r.get(prop);
    if (prop === 'key') {
      prop = 'key_id';
    } else {
      prop = 'x_entity_id';
    }
    if (value) {
      var partner_token = r.get('partner_token');
      if (partner_token) {
        value += '&partner_token=' + partner_token;
      }
      return url + '?' + prop + '=' + value;
    }
  }
  return url;
}

var Razorpay = (window.Razorpay = function(overrides) {
  if (!(this instanceof Razorpay)) {
    return new Razorpay(overrides);
  }
  Eventer.call(this);
  this.id = generateUID();

  var options;
  try {
    options = base_configure(overrides);
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

  if (
    ba_keys.every(function(prop) {
      return !options.get(prop);
    })
  ) {
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
    return parseInt((principle * rate * multiplier) / (multiplier - 1), 10);
  }
};

function getPrefsJsonp(data, callback) {
  return jsonp({
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
  partner_token: '',
  image: '',
  amount: 100,
  currency: 'INR',
  order_id: '',
  invoice_id: '',
  subscription_id: '',
  payment_link_id: '',
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
  display_amount: '',
  recurring_token: {
    max_amount: 0,
    expire_by: 0
  }
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
    var key_id = getter('key');
    if (key_id) {
      params.key_id = key_id;
    }

    each(
      [
        'order_id',
        'customer_id',
        'invoice_id',
        'subscription_id',
        'recurring',
        'subscription_card_change',
        'partner_token'
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

  amount: function(amount, options) {
    if (!isValidAmount(amount) && !options.recurring) {
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
      errorMessage = validation(options[key], options);
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

discreet.currencies = {
  AFN: '&#x60b;',
  ALL: '&#x6b;',
  DZD: 'د.ج',
  WST: 'T',
  EUR: '&#8364;',
  AOA: 'Kz',
  XCD: 'EC$',
  ARS: '$',
  AMD: '&#1423;',
  AWG: 'ƒ',
  AUD: 'A$',
  AZN: 'ман',
  BSD: 'B$',
  BHD: 'د.ب',
  BDT: '&#x9f3;',
  BBD: 'Bds$',
  BYR: 'Br',
  BZD: 'BZ$',
  XOF: 'CFA',
  BMD: 'BD$',
  BTN: 'Nu.',
  BOB: 'Bs.',
  BAM: 'KM',
  BWP: 'P',
  BRL: 'R$',
  USD: '$',
  BND: 'B$',
  BGN: 'лв',
  BIF: 'FBu',
  KHR: '៛',
  XAF: 'CFA',
  CAD: 'C$',
  CVE: 'Esc',
  KYD: 'KY$',
  CLP: '$',
  CNY: '&#165;',
  COP: '$',
  KMF: 'CF',
  NZD: 'NZ$',
  CRC: '&#x20a1;',
  HRK: 'Kn',
  CUC: '&#x20b1;',
  ANG: 'ƒ',
  CZK: 'Kč',
  CDF: 'FC',
  DKK: 'Kr.',
  DJF: 'Fdj',
  DOP: 'RD$',
  EGP: 'E&#163;',
  SVC: '&#x20a1;',
  ERN: 'Nfa',
  ETB: 'Br',
  FKP: 'FK&#163;',
  FJD: 'FJ$',
  XPF: 'F',
  GMD: 'D',
  GEL: 'ლ',
  GHS: '&#x20b5;',
  GIP: '&#163;',
  GTQ: 'Q',
  GBP: '&#163;',
  GNF: 'FG',
  GYD: 'GY$',
  HTG: 'G',
  HNL: 'L',
  HKD: 'HK$',
  HUF: 'Ft',
  ISK: 'Kr',
  IDR: 'Rp',
  IRR: '&#xfdfc;',
  IQD: 'ع.د',
  ILS: '&#x20aa;',
  JMD: 'J$',
  JPY: '&#165;',
  JOD: 'د.ا',
  KZT: '&#x20b8;',
  KES: 'KSh',
  KWD: 'د.ك',
  KGS: 'лв',
  LAK: '&#x20ad;',
  LVL: 'Ls',
  LBP: 'L&#163;',
  LSL: 'L',
  LRD: 'L$',
  LD: 'ل.د',
  LYD: 'ل.د',
  CHF: 'Fr',
  LTL: 'Lt',
  MOP: 'P',
  MKD: 'ден',
  MGA: 'Ar',
  MWK: 'MK',
  MYR: 'RM',
  MVR: 'Rf',
  MRO: 'UM',
  MUR: 'Ɍs',
  MXN: '$',
  MDL: 'L',
  MNT: '&#x20ae;',
  MAD: 'د.م.',
  MZN: 'MT',
  MMK: 'K',
  NAD: 'N$',
  NPR: 'NɌs',
  NIO: 'C$',
  NGN: '&#x20a6;',
  KPW: '₩',
  NOK: 'Kr',
  OMR: 'ر.ع.',
  PKR: 'Ɍs',
  PAB: 'B/.',
  PGK: 'K',
  PYG: '&#x20b2;',
  PEN: 'S/.',
  PHP: '&#x20b1;',
  PLN: 'Zł',
  QAR: 'QAR',
  RON: 'L',
  RUB: 'руб',
  RWF: 'RF',
  SHP: '&#163;',
  STD: 'Db',
  SAR: 'ر.س',
  RSD: 'Дин.',
  SCR: 'Ɍs',
  SLL: 'Le',
  SGD: 'S$',
  SBD: 'SI$',
  SOS: 'So. Sh.',
  ZAR: 'R',
  KRW: '₩',
  SDG: '&#163;Sd',
  LKR: 'Rs',
  SFR: 'Fr',
  SRD: '$',
  SZL: 'L',
  SEK: 'Kr',
  SYP: 'S&#163;',
  TWD: 'NT$',
  TJS: 'SM',
  TZS: 'TSh',
  THB: '&#x0e3f;',
  TOP: 'T$',
  TTD: 'TT$',
  TND: 'د.ت',
  TRY: 'TL',
  TMT: 'M',
  UGX: 'USh',
  UAH: '&#x20b4;',
  AED: 'د.إ',
  UYU: '$U',
  UZS: 'лв',
  VUV: 'VT',
  VEF: 'Bs',
  VND: '&#x20ab;',
  YER: '&#xfdfc;',
  ZMK: 'ZK',
  ZWL: 'Z$'
};
