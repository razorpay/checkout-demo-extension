var $ = function(el){
  if(typeof el === 'string') {
    return $(document.querySelector(el))
  }
  if(!(this instanceof $)) { return new $(el) }
  this[0] = el;
};

function bind(func, thisArg){
  return function(){
    return func.apply(thisArg, arguments);
  }
}

function clone(target){
  return JSON.parse(stringify(target));
}

var qs = bind(document.querySelector, document);
var $$ =  bind(document.querySelectorAll, document);
var gel = bind(document.getElementById, document);
var stringify = bind(JSON.stringify, JSON);

function each( iteratee, eachFunc, thisArg ) {
  var i;
  if(arguments.length < 3){
    thisArg = this;
  }
  if( iteratee ) {
    if ( iteratee.length ) { // not using instanceof Array, to iterate over nodeList
      for ( i = 0; i < iteratee.length; i++ ) {
        eachFunc.call(thisArg, i, iteratee[i]);
      }
    }
    else {
      for ( i in iteratee ) {
        eachFunc.call(thisArg, i, iteratee[i]);
      }
    }
  }
}

function invokeEach(iteratee, thisArg){
  each(
    iteratee,
    function(key, func){
      func.call(thisArg);
    },
    thisArg
  )
}

function map( iteratee, mapFunc ) {
  var result = iteratee instanceof Array ? [] : {};
  each(iteratee, function(i, val){
    result[i] = mapFunc(val, i);
  })
  return result;
}

function submitForm(action, data, method, target) {
  var form = document.createElement('form');
  form.setAttribute('action', action);

  if(method){ form.setAttribute('method', method) }
  if(target){ form.setAttribute('target', target) }
  if(data){ form.innerHTML = deserialize(data) }

  doc.appendChild(form);
  form.submit();
  doc.removeChild(form);
}

function deserialize(data, key){
  if(typeof data === 'object'){
    var str = '';
    each(
      data,
      function(name, value){
        if(key){
          name = key + '[' + name + ']';
        }
        str += deserialize(value, name);
      }
    )
    return str;
  }
  return '<input type="hidden" name="' + key + '" value="' + data + '">';
}

function preventDefault(e){
  if(e && e.preventDefault){
    e.preventDefault();
  }
}

function invoke(handler, thisArg, param , timeout){
  if(typeof timeout === 'number'){
    return setTimeout(
      function(){
        invoke(handler, thisArg, param)
      },
      timeout
    )
  }
  if(typeof handler === 'string'){
    handler = thisArg[handler];
  }
  if(typeof handler === 'function'){
    if(!thisArg){
      thisArg = this;
    }
    if(arguments.length === 3){
      return handler.call(thisArg, param);
    }
    return handler.call(thisArg);
  }
}

$.prototype = {
  on: function(event, callback, capture, thisArg){
    var el = this[0];
    if(!el) { return }

    var ref;
    var shouldAddListener = window.addEventListener;
    if (shouldAddListener) {
      ref = function(e){
        if( e.target.nodeType === 3 ) {
          e.target = e.target.parentNode;// textNode target
        }
        callback.call(thisArg || this, e);
      }
    } else {
      ref = function(e){
        if(!e) { e = window.event }
        if(!e.target) { e.target = e.srcElement || document }
        if(!e.preventDefault) { e.preventDefault = function() { this.returnValue = false } }
        if(!e.currentTarget) { e.currentTarget = el }
        callback.call(thisArg || el, e);
      }
    }
    each(
      event.split(' '),
      function(i, evt){
        if( shouldAddListener ) {
          el.addEventListener(evt, ref, !!capture)
        }
        else {
          el.attachEvent('on' + evt, ref);
        }
      }
    )
    return bind(
      function(){
        this.off(event, ref, capture);
      },
      this
    )
  },

  off: function(event, callback, capture){
    if (window.removeEventListener) {
      this[0].removeEventListener(event, callback, !!capture);
    } else if(window.detachEvent){
      this[0].detachEvent('on' + event, callback);
    }
  },

  prop: function(prop, val){
    var el = this[0];
    if(arguments.length === 1){
      return el[prop];
    }
    if(el){
      if(el){
        el[prop] = val;
      }
      return this;
    }
    return '';
  },

  attr: function(attr, val){
    if(typeof attr === 'object'){
      each(
        attr,
        function(key, val){
          this.attr(key, val);
        },
        this
      )
      return this;
    }
    var el = this[0];
    if(arguments.length === 1){
      return el.getAttribute(attr);
    }
    el.setAttribute(attr, val);
    return this;
  },

  reflow: function(){
    this.prop('offsetWidth');
    return this;
  },

  remove: function(){
    try{
      var el = this[0];
      el.parentNode.removeChild(el);
    } catch(e){}
    return this;
  },

  append: function(el){
    this[0].appendChild(el);
  },

  hasClass: function(str){
    return (' ' + this[0].className + ' ').indexOf(' ' + str + ' ') >= 0;
  },

  addClass: function(str){
    var el = this[0];
    if(str && el){
      if(!el.className){
        el.className = str;
      }
      else if(!this.hasClass(str)){
        el.className += ' ' + str;
      }
    }
    return this;
  },

  removeClass: function(str){
    var el = this[0];
    if(el){
      var className = (' ' + el.className + ' ').replace(' ' + str + ' ', ' ').replace(/^ | $/g,'');
      if( el.className !== className ){
        el.className = className;
      }
    }
    return this;
  },

  toggleClass: function(className, condition){
    if(arguments.length === 1){
      condition = !this.hasClass(className);
    }
    return this[(condition ? 'add' : 'remove') + 'Class'](className);
  },

  find: function(selector){
    var node = this[0];
    if(node){
      return node.querySelectorAll(selector);
    }
  },

  css: function(prop, value){
    var style = this.prop('style');
    if(style){
      if( arguments.length === 1 ) {
        return style[prop];
      }
      try {
        style[prop] = value;
      } catch(e){} // IE can not set invalid css rules without throwing up.
    }
    return this;
  },

  hide: function(){
    return this.css('display', 'none');
  },

  parent: function(){
    return $(this.prop('parentNode'));
  },

  val: function(value){
    if(!arguments.length){
      return this[0].value;
    }
    this[0].value = value;
    return this;
  },

  html: function(html){
    if(arguments.length){
      this[0].innerHTML = html;
      return this;
    }
    return this[0].innerHTML;
  },

  focus: function(){
    if(this[0]){
      try{
        this[0].focus();
      }
      catch(e){}
    }
    return this;
  },

  blur: function(){
    if(this[0]){
      try{
        this[0].blur();
      }
      catch(e){}
    }
    return this;
  }
}

$.post = function(opts){
  opts.method = 'post';

  if(!opts.headers){
    opts.headers = emo;
  }
  opts.headers['Content-type'] = 'application/x-www-form-urlencoded';
  var payload = [];
  each(opts.data, function(key, val){
    payload.push(key + '=' + encodeURIComponent(val))
  })
  opts.data = payload.join('&');
  return $.ajax(opts);
}

$.ajax = function(opts){
  var xhr = new XMLHttpRequest();
  if(!opts.method){
    opts.method = 'get';
  }
  xhr.open(opts.method, opts.url, true);

  each(
    opts.headers,
    function(header, value){
      xhr.setRequestHeader(header, value);
    }
  )

  if(opts.callback){
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
        opts.callback(JSON.parse(xhr.responseText));
      }
    }
    xhr.onerror = function(){
      opts.callback({error: {description: 'Network error'}});
    }
  }
  xhr.send(opts.data || null);
  return xhr;
}
var base62Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Chars = base62Chars + '+=';
base62Chars = base62Chars.slice(52) + base62Chars.slice(0, 52);
var map62 = {};
each(
  base62Chars,
  function(i, chr){
    map62[chr] = i;
  }
)

var _btoa = window.btoa;
if(!_btoa){
  _btoa = function(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = '';
    while(i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if(i === len)
      {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if(i === len)
      {
        out += base64Chars.charAt(c1 >> 2);
        out += base64Chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64Chars.charAt((c2 & 0xF) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += base64Chars.charAt(c1 >> 2);
      out += base64Chars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
      out += base64Chars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
      out += base64Chars.charAt(c3 & 0x3F);
    }
    return out;
  };
}

function _toBase10(str62){
  var val = 0;
  var len = str62.length;
  each(
    str62,
    function(index, character){
      val += map62[character] * Math.pow(62, len - index);
    }
  )
  return val/62;
}

function _toBase62(number){
  var rixit;
  var result = '';
  while (number) {
    rixit = number % 62;
    result = base62Chars[rixit] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

var _uid = generateUID();

function generateUID(){
  var num = _toBase62(
    (new Date().getTime() - 1388534400000).toString() +
    ('000000' + Math.floor(1000000*Math.random())).slice(-6)
  ) +
  _toBase62(Math.floor(238328*Math.random())) + '0';

  var sum = 0, tempdigit;
  each(
    num,
    function(i){
      tempdigit = map62[num[num.length - 1 - i]];
      if((num.length - i) % 2){
        tempdigit *= 2;
      }
      if(tempdigit >= 62){
        tempdigit = tempdigit % 62 + 1;
      }
      sum += tempdigit;
    }
  )
  tempdigit = sum % 62;
  if(tempdigit){
    tempdigit = base62Chars[62 - tempdigit];
  }
  return num.slice(0, 13) + tempdigit
}

function track(id, event, props){
  if(id instanceof Razorpay){
    if(!id.isLiveMode()){
      return;
    }
    id = id.id;
  }
  setTimeout(function(){
    var payload = {
      context: {
        direct: true
      },
      anonymousId: id,
      event: event
    };
    var data = payload.properties = {
      id: id
    };
    if(props && event === 'js_error' && props instanceof Error){
      // if props is error object, extract relevant properties
      props = {message: props.message, stack: props.stack}
    }
    if(props){
      each(
        props,
        function(propKey, propVal){
          var valType = typeof propVal;
          if(valType === 'string' || valType === 'number' || valType === 'boolean'){
            data[propKey] = propVal;
          }
        }
      )
    }

    data.medium = discreet.medium;
    data.user_agent = ua;
    if(discreet.context){
      data.page_url = discreet.context;
    }
    data.checkout = !!discreet.isFrame;

    var xhr = new XMLHttpRequest();
    xhr.open(
      'post',
      'https://api.segment.io/v1/track',
      true
    );
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + _btoa('vz3HFEpkvpzHh8F701RsuGDEHeVQnpSj:'));
    xhr.send(JSON.stringify(payload));
  })
}
var roll = function(){};
var noop = roll;
var emo = {};

function err(errors){
  if(errors instanceof Array && !errors.length){
    return false;
  }
  return true;
}

var doc = document.body || document.documentElement;
var ua = navigator.userAgent;
var shouldFixFixed = /iPhone|Android 2\./.test(ua);

var RazorpayConfig;
var global_Razorpay = window.Razorpay;
if(typeof global_Razorpay === 'object' && global_Razorpay && typeof global_Razorpay.config === 'object'){
  RazorpayConfig = global_Razorpay.config;
}
else {
  RazorpayConfig = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1/'
  }
}

var Razorpay = window.Razorpay = function(options){
  if(!(this instanceof Razorpay)){
    return new Razorpay(options);
  }
  invoke(this.configure, this, options);
};

Razorpay.defaults = {
  'key': '',
  'amount': '',
  'currency': 'INR',
  'order_id': '',
  'handler': function(data){
    if(this.callback_url){
      submitForm(this.callback_url, data, 'post');
    }
  },
  'notes': {},
  'callback_url': '',

  'redirect': false,
  'description': '',

  // automatic checkout only
  'buttontext': 'Pay Now',

  // checkout fields, not needed for razorpay alone
  'parent': null,
  'display_currency': '',
  'display_amount': '',

  'method': {
    'netbanking': true,
    'card': true,
    'wallet': true,
    'emi': true
  },
  'prefill': {
    'method': '',
    'name': '',
    'contact': '',
    'email': '',
    'card[number]': '',
    'card[expiry]': ''
  },
  'modal': {
    'ondismiss': noop,
    'onhidden': noop,
    'escape': true,
    'animation': true,
    'backdropclose': false
  },
  'external': {
    wallets: [],
    handler: noop
  },
  'theme': {
    'color': '#00BCD4',
    'backdrop_color': 'rgba(0,0,0,0.6)',
    'image_padding': true,
    'close_button': true
  },
  'customer_id': '',
  'signature': '',
  'name': '', // of merchant
  'image': ''
};
var flatKeys = {};
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

function base_set(flatObj, defObj, objKey, objVal){
  objKey = objKey.toLowerCase();
  var defaultVal = defObj[objKey];
  if(typeof objVal === 'number'){
    objVal = String(objVal);
  }
  if(typeof defaultVal === typeof objVal){
    flatObj[objKey] = objVal;
  }
}

function flatten(obj, defObj){
  var flatObj = {};
  each(
    obj,
    function(objKey, objVal){
      if(objKey in flatKeys){
        each(
          objVal,
          function(objSubKey, objSubVal){
            base_set(flatObj, defObj, objKey + '.' + objSubKey, objSubVal);
          }
        )
      } else {
        base_set(flatObj, defObj, objKey, objVal);
      }
    }
  )
  return flatObj;
}

function Options(options){
  if(!(this instanceof Options)){
    return new Options(options, defaults);
  }

  var defaults = Razorpay.defaults;
  options = flatten(options, defaults);

  this.get = function(key){
    if(!arguments.length){
      return options;
    }
    return key in options ? options[key] : defaults[key];
  }

  this.set = function(key, val){
    options[key] = val;
  }

  this.unset = function(key){
    delete options[key];
  }
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

Razorpay.prototype = {
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
      if(!this.isLiveMode()){
        alert(message);
      }
      raise(message);
    }

    if(this instanceof Razorpay){
      this.id = generateUID();
      this.modal = {options: emo};
      this.options = emo;

      if(this.get('parent')){
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
var ch_PageY = 0;
// there is no "position: fixed" in iphone
var docStyle = doc.style;
var merchantMarkup = {
  overflow: '',
  meta: null,

  orientationchange: function(){
    this.el.style.height = Math.max(window.innerHeight || 0, 480) + 'px';
  },

  // scroll manually in iPhone
  scroll: function(){
    if(typeof window.pageYOffset !== 'number'){
      return;
    }

    var top;
    var offTop = frameContainer.offsetTop - pageYOffset;
    var offBot = frameContainer.offsetHeight + offTop;
    if(ch_PageY < pageYOffset){
      if(offBot < 0.2*innerHeight && offTop < 0){
        top = pageYOffset + innerHeight - frameContainer.offsetHeight;
      }
    }
    else if(ch_PageY > pageYOffset){
      if(offTop > 0.1*innerHeight && offBot > innerHeight){
        top = pageYOffset;
      }
    }
    if(typeof top === 'number'){
      frameContainer.style.top = Math.max(0, top) + 'px';
    }
    ch_PageY = pageYOffset;

  }
}

function getMeta(){
  if(!merchantMarkup.meta){
    merchantMarkup.meta = qs('head meta[name=viewport]');
  }
  return merchantMarkup.meta;
}

function restoreMeta($meta){
  if($meta){
    $meta.remove();
  }
  var oldMeta = getMeta();
  if(oldMeta){
    qs('head').appendChild(oldMeta);
  }
}

function restoreOverflow(){
  docStyle.overflow = merchantMarkup.overflow;
}

// to handle absolute/relative url of options.image
function sanitizeImage(options){
  if(options.image && typeof options.image === 'string'){
    if(discreet.isBase64Image(options.image)){
      return;
    }
    if(options.image.indexOf('http')){ // not 0
      var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
      var relUrl = '';
      if(options.image[0] !== '/'){
        relUrl += location.pathname.replace(/[^\/]*$/g,'');
        if(relUrl[0] !== '/'){
          relUrl = '/' + relUrl;
        }
      }
      options.image = baseUrl + relUrl + options.image;
    }
  }
}

function makeCheckoutUrl(key){
  if(key){
    return discreet.makeUrl() + 'checkout?key_id=' + key;
  }
  return discreet.makeUrl() + 'checkout/public?new=1';
}

function makeCheckoutMessage(rzp){
  var options = rzp.get();
  var response = {
    context: location.href,
    options: options,
    config: RazorpayConfig,
    id: rzp.id
  }

  each(
    rzp.modal.options,
    function(i, option){
      options['modal.' + i] = option;
    }
  )

  if(options.parent){
    response.embedded = true;
    options.parent = true;
  }

  sanitizeImage(options);
  return response;
}

function getEncodedMessage(rzp){
  return _btoa(stringify(makeCheckoutMessage(rzp)));
}

function setBackdropColor(value){
  // setting unsupported value throws error in IE
  try{ frameBackdrop.style.background = value; }
  catch(e){}
}

function setTestRibbonVisible(){
  testRibbon.style.opacity = 1.0;
}

function setTestRibbonInvisible(){
  testRibbon.style.opacity = 0.0;
}

function CheckoutFrame(rzp){
  if(rzp){
    this.getEl(rzp);
    return this.openRzp(rzp);
  }
  this.getEl();
}

CheckoutFrame.prototype = {
  getEl: function(rzp){
    if(!this.el){
      var key = rzp && rzp.get('key');
      this.el = $(document.createElement('iframe'))
        .attr({
          'class': 'razorpay-checkout-frame', // quotes needed for ie
          style: 'height: 100%; position: relative; background: none; display: block; border: 0 none transparent; margin: 0px; padding: 0px;',
          allowtransparency: true,
          frameborder: 0,
          width: '100%',
          height: '100%',
          src: makeCheckoutUrl(key)
        }
      )[0]
    }
    return this.el;
  },

  openRzp: function(rzp){
    var el = this.el;
    this.bind();
    var parent = rzp.get('parent');
    var $parent = $(parent || frameContainer);
    var message;

    if(rzp !== this.rzp){
      message = makeCheckoutMessage(rzp);

      if(!this.rzp && this.el.parentNode !== $parent[0]){
        $parent.append(this.el);
      }

      this.rzp = rzp;
    }
    else {
      message = {event: 'open'};
    }
    this.afterLoad(function(){
      this.postMessage(message);
    })

    if(parent){
      this.el.removeAttribute('style');
      this.embedded = true;
      this.afterClose = noop;
    }
    else {
      $parent.css('display', 'block').reflow();
      setBackdropColor(rzp.get('theme.backdrop_color'));
      if(/^rzp_t/.test(rzp.get('key'))){
        setTestRibbonVisible();
      }
      this.setMetaAndOverflow();
    }
  },

  close: function(){
    setBackdropColor('');
    setTestRibbonInvisible();
    restoreMeta(this.$meta);
    restoreOverflow();
  },

  bind: function(){
    if(!this.listeners){
      this.listeners = [];
      var eventPairs = { message: this.onmessage };

      if(shouldFixFixed){
        eventPairs.orientationchange = merchantMarkup.orientationchange;
        eventPairs.scroll = merchantMarkup.scroll;
      }

      each(
        eventPairs,
        function(event, listener){
          this.listeners.push(
            $(window).on(event, listener, null, this)
          )
        },
        this
      )
    }
  },

  unbind: function(){
    invokeEach(this.listeners);
    this.listeners = null;
  },

  setMetaAndOverflow: function(){
    var head = qs('head');
    if(!head){
      return;
    }
    $(getMeta()).remove();

    this.$meta = $(document.createElement('meta'))
      .attr({
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      })

    head.appendChild(this.$meta[0]);

    merchantMarkup.overflow = docStyle.overflow;
    docStyle.overflow = 'hidden';

    if(shouldFixFixed){
      scrollTo(0, 0);
      merchantMarkup.orientationchange.call(this);
      merchantMarkup.scroll.call(this);
    }
  },

  postMessage: function(response){
    if(typeof response !== 'object'){
      // TODO roll
    }
    response.id = this.rzp.id;
    response = stringify(response);
    this.el.contentWindow.postMessage(response, '*');
  },

  afterLoad: function(handler){
    if(this.hasLoaded === true){
      handler.call(this);
    } else {
      this.loadedCallback = handler;
    }
  },

  onmessage: function(e){
    var data;
    try{
      data = JSON.parse(e.data);
    }
    catch(err){
      return;
    }

    var event = data.event;
    var rzp = this.rzp;
    // source check
    if(
      !e.origin ||
      data.source !== 'frame' ||
      (event !== 'load' && rzp && rzp.id !== data.id) ||
      e.source !== this.el.contentWindow ||
      this.el.getAttribute('src').indexOf(e.origin)
    ){
      return;
    }
    data = data.data;
    invoke('on' + event, this, data);

    if(event === 'dismiss' || event === 'fault' && rzp.isLiveMode()){
      track(rzp, event);
    }
  },

  onload: function() {
    invoke('loadedCallback', this);
    this.hasLoaded = true;
  },

  onredirect: function(data){
    discreet.redirect(data);
  },

  onsubmit: function(data){
    if(data.method === 'wallet'){
      // check if it was one of the external wallets
      var rzp = this.rzp;
      each(
        rzp.get('external.wallets'),
        function(i, walletName){
          if(walletName === data.wallet){
            try{
              rzp.get('external.handler').call(rzp, data);
            } catch(e){
              track(rzp, 'js_error', e);
            }
          }
        }
      )
    }
  },

  ondismiss: function(){
    this.close();
    invoke(this.rzp.get('modal.ondismiss'));
  },

  onhidden: function(){
    this.afterClose();
    invoke(this.rzp.get('modal.onhidden'));
  },

  // this is onsuccess method
  oncomplete: function(data){
    this.close();
    var rzp = this.rzp;
    track(rzp, 'checkout_success', data);
    invoke(
      function(){
        try{
          this.get('handler')(data);
        }
        catch(e){
          track(rzp, 'js_error', e);
          throw e;
        }
      },
      rzp,
      null,
      200
    );
  },

  onfailure: function(data){
    this.ondismiss();
    alert('Payment Failed.\n' + data.error.description);
    this.onhidden();
  },

  onfault: function(message){
    this.rzp.close();
    alert('Oops! Something went wrong.\n' + message);
    this.afterClose();
  },

  afterClose: function(){
    frameContainer.style.display = 'none';
    this.unbind();
  }
}
// flag for checkout-js
discreet.isCheckout = true;
var currentScript = document.currentScript || (function() {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
})();

var communicator;

/**
  default handler for success
  it just submits everything via the form
  @param  {[type]} data [description]
  @return {[type]}    [description]
*/
var defaultAutoPostHandler = function(data){
  var RazorPayForm = currentScript.parentNode;
  var div = document.createElement('div');
  div.innerHTML = deserialize(data);
  RazorPayForm.appendChild(div);
  RazorPayForm.onsubmit = noop;
  RazorPayForm.submit();
}

var addAutoCheckoutButton = function(rzp){
  var button = document.createElement('input');
  var form = currentScript.parentElement;
  button.type = 'submit';
  button.value = rzp.get('buttontext');
  button.className = 'razorpay-payment-button';
  form.appendChild(button);
  form.onsubmit = function(e){
    e.preventDefault();
    rzp.open();
    return false;
  }
}

/**
* This checks whether we are in automatic mode
* If yes, it puts in the button
*/
function initAutomaticCheckout(){
  var opts = {};
  each(
    currentScript.attributes,
    function(i, attr){
      var name = attr.name
      if(/^data-/.test(name)){
        name = name.replace(/^data-/,'');
        var val = attr.value;
        if(val === 'true'){
          val = true;
        } else if (val === 'false'){
          val = false;
        }
        opts[name] = val;
      }
    }
  )

  var amount = currentScript.getAttribute('data-amount');
  if (amount && amount.length > 0){
    opts.handler = defaultAutoPostHandler;
    addAutoCheckoutButton(Razorpay(opts));
  }
}

function createFrameContainer(){
  var div = document.createElement('div');
  div.className = 'razorpay-container';
  var style = div.style;
  var rules = {
    'zIndex': '99999',
    'position': shouldFixFixed ? 'absolute' : 'fixed',
    'top': 0,
    'display': 'none',
    'left': 0,
    'height': '100%',
    'width': '100%',
    '-webkit-transition': '0.2s ease-out top',
    '-webkit-overflow-scrolling': 'touch',
    '-webkit-backface-visibility': 'hidden',
    'overflow-y': 'visible'
  }
  each(
    rules,
    function(i, rule) {
      style[i] = rule;
    }
  )
  doc.appendChild(div);
  return div;
}

function createFrameBackdrop(){
  var backdrop = document.createElement('div');
  backdrop.className = 'razorpay-backdrop';
  var style = backdrop.style;
  each(
    {
      'min-height': '100%',
      'transition': '0.3s ease-out',
      '-webkit-transition': '0.3s ease-out',
      '-moz-transition': '0.3s ease-out',
      'position': 'fixed',
      'top': 0,
      'left': 0,
      'width': '100%',
      'height': '100%',
      'filter': 'progid:DXImageTransform.Microsoft.gradient(startColorstr=#96000000, endColorstr=#96000000)'
    },
    function(ruleKey, value){
      style[ruleKey] = value;
    }
  )
  frameContainer.appendChild(backdrop);
  return backdrop;
}

function createTestRibbon(){
  var ribbon = document.createElement('span');
  ribbon.target = '_blank';
  ribbon.href = '';
  ribbon.innerHTML = 'Test Mode';
  var style = ribbon.style;
  var animRule = 'opacity 0.3s ease-in';
  var rotateRule = 'rotate(45deg)';
  each(
    {
      'text-decoration': 'none',
      'background': '#D64444',
      'border': '1px dashed white',
      'padding': '3px',
      'opacity': '0',
      '-webkit-transform': rotateRule,
      '-moz-transform': rotateRule,
      '-ms-transform': rotateRule,
      '-o-transform': rotateRule,
      'transform': rotateRule,
      '-webkit-transition': animRule,
      '-moz-transition': animRule,
      'transition': animRule,
      'font-family': 'lato,ubuntu,helvetica,sans-serif',
      'color': 'white',
      'position': 'absolute',
      'width': '200px',
      'text-align': 'center',
      'right': '-50px',
      'top': '50px'
    },
    function(ruleKey, value){
      style[ruleKey] = value;
    }
  )
  frameBackdrop.appendChild(ribbon);
  return ribbon;
}

var frameContainer = createFrameContainer();
var frameBackdrop = createFrameBackdrop();
var testRibbon = createTestRibbon();
var preloadedFrame = getPreloadedFrame();

function getPreloadedFrame(){

  if(!preloadedFrame && discreet.supported()){
    preloadedFrame = new CheckoutFrame();
    preloadedFrame.bind();
    frameContainer.appendChild(preloadedFrame.el);
  }
  return preloadedFrame;
}

Razorpay.open = function(options) {
  return Razorpay(options).open();
}

Razorpay.prototype.open = function() {
  if(!this.get('redirect') && !discreet.supported(true)){
    return;
  }

  var frame = this.checkoutFrame;
  if(!frame){
    if(this.get('parent')){
      frame = new CheckoutFrame(this);
    }
    else {
      frame = getPreloadedFrame();
    }
    this.checkoutFrame = frame;
  }
  if(!frame.embedded){
    frame.openRzp(this);
  }

  if(!frame.el.contentWindow){
    frame.close();
    frame.afterClose();
    alert('This browser is not supported.\nPlease try payment in another browser.');
  }

  return this;
};

Razorpay.prototype.close = function(){
  var frame = this.checkoutFrame;
  if(frame){
    frame.postMessage({event: 'close'});
  }
};

// Get the ball rolling in case we are in manual mode
initAutomaticCheckout();
