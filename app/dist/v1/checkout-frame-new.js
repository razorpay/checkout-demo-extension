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
        if(!e.currentTarget) { e.currentTarget = e.target }
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
var Rollbar;
try{
  /* jshint ignore:start */
  !function(e){function r(n){if(t[n])return t[n].exports;var o=t[n]={exports:{},id:n,loaded:!1};return e[n].call(o.exports,o,o.exports,r),o.loaded=!0,o.exports}var t={};return r.m=e,r.c=t,r.p="",r(0)}([function(e,r,t){"use strict";function n(){var e="undefined"==typeof JSON?{}:JSON;o.setupJSON(e)}var o=t(1),i=t(2);n();var a=window._rollbarConfig,s=a&&a.globalAlias||"Rollbar",u=window[s]&&"undefined"!=typeof window[s].shimId;!u&&a?o.wrapper.init(a):(window.Rollbar=o.wrapper,window.RollbarNotifier=i.Notifier),e.exports=o.wrapper},function(e,r,t){"use strict";function n(e,r,t){!t[4]&&window._rollbarWrappedError&&(t[4]=window._rollbarWrappedError,window._rollbarWrappedError=null),e.uncaughtError.apply(e,t),r&&r.apply(window,t)}function o(e,r){if(r.hasOwnProperty&&r.hasOwnProperty("addEventListener")){var t=r.addEventListener;r.addEventListener=function(r,n,o){t.call(this,r,e.wrap(n),o)};var n=r.removeEventListener;r.removeEventListener=function(e,r,t){n.call(this,e,r&&r._wrapped||r,t)}}}var i=t(2),a=t(7),s=i.Notifier;window._rollbarWrappedError=null;var u={};u.init=function(e,r){var t=new s(r);if(t.configure(e),e.captureUncaught){var i;r&&a.isType(r._rollbarOldOnError,"function")?i=r._rollbarOldOnError:window.onerror&&!window.onerror.belongsToShim&&(i=window.onerror),window.onerror=function(){var e=Array.prototype.slice.call(arguments,0);n(t,i,e)};var u,c,l=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestUpload"];for(u=0;u<l.length;++u)c=l[u],window[c]&&window[c].prototype&&o(t,window[c].prototype)}return window.Rollbar=t,s.processPayloads(),t},e.exports={wrapper:u,setupJSON:i.setupJSON}},function(e,r,t){"use strict";function n(e){b=e,v.setupJSON(e)}function o(e,r){return function(){var t=r||this;try{return e.apply(t,arguments)}catch(n){console.error("[Rollbar]:",n)}}}function i(){d||(d=setTimeout(p,1e3))}function a(){return y}function s(e){y=y||this;var r="https://"+s.DEFAULT_ENDPOINT;this.options={enabled:!0,endpoint:r,environment:"production",scrubFields:h([],s.DEFAULT_SCRUB_FIELDS),checkIgnore:null,logLevel:s.DEFAULT_LOG_LEVEL,reportLevel:s.DEFAULT_REPORT_LEVEL,uncaughtErrorLevel:s.DEFAULT_UNCAUGHT_ERROR_LEVEL,payload:{}},this.lastError=null,this.plugins={},this.parentNotifier=e,e&&(e.hasOwnProperty("shimId")?e.notifier=this:this.configure(e.options))}function u(e){return o(function(){var r=this._getLogArgs(arguments);return this._log(e||r.level||this.options.logLevel||s.DEFAULT_LOG_LEVEL,r.message,r.err,r.custom,r.callback)})}function c(e,r){e||(e=r?b.stringify(r):"");var t={body:e};return r&&(t.extra=h(!0,{},r)),{message:t}}function l(e,r,t){var n=g.guessErrorClass(r.message),o=r.name||n[0],i=n[1],a={exception:{"class":o,message:i}};if(e&&(a.exception.description=e||"uncaught exception"),r.stack){var s,u,l,p,f,d,v,w;for(a.frames=[],v=0;v<r.stack.length;++v)s=r.stack[v],u={filename:s.url?m.sanitizeUrl(s.url):"(unknown)",lineno:s.line||null,method:s.func&&"?"!==s.func?s.func:"[anonymous]",colno:s.column},l=p=f=null,d=s.context?s.context.length:0,d&&(w=Math.floor(d/2),p=s.context.slice(0,w),l=s.context[w],f=s.context.slice(w)),l&&(u.code=l),(p||f)&&(u.context={},p&&p.length&&(u.context.pre=p),f&&f.length&&(u.context.post=f)),s.args&&(u.args=s.args),a.frames.push(u);return a.frames.reverse(),t&&(a.extra=h(!0,{},t)),{trace:a}}return c(o+": "+i,t)}function p(){var e;try{for(;e=window._rollbarPayloadQueue.shift();)f(e.endpointUrl,e.accessToken,e.payload,e.callback)}finally{d=void 0}}function f(e,r,t,n){n=n||function(){};var o=(new Date).getTime();o-x>=6e4&&(x=o,L=0);var i=window._globalRollbarOptions.maxItems,a=window._globalRollbarOptions.itemsPerMinute,s=function(){return!t.ignoreRateLimit&&i>=1&&_>=i},u=function(){return!t.ignoreRateLimit&&a>=1&&L>=a};return s()?void n(new Error(i+" max items reached")):u()?void n(new Error(a+" items per minute reached")):(_++,L++,s()&&y._log(y.options.uncaughtErrorLevel,"maxItems has been hit. Ignoring errors for the remainder of the current page load.",null,{maxItems:i},null,!1,!0),t.ignoreRateLimit&&delete t.ignoreRateLimit,void w.post(e,r,t,function(e,r){return e?n(e):n(null,r)}))}var d,h=t(3),g=t(4),m=t(7),v=t(9),w=v.XHR,b=null;s.NOTIFIER_VERSION="1.8.3",s.DEFAULT_ENDPOINT="api.rollbar.com/api/1/",s.DEFAULT_SCRUB_FIELDS=["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken"],s.DEFAULT_LOG_LEVEL="debug",s.DEFAULT_REPORT_LEVEL="debug",s.DEFAULT_UNCAUGHT_ERROR_LEVEL="error",s.DEFAULT_ITEMS_PER_MIN=60,s.DEFAULT_MAX_ITEMS=0,s.LEVELS={debug:0,info:1,warning:2,error:3,critical:4},window._rollbarPayloadQueue=window._rollbarPayloadQueue||[],window._globalRollbarOptions={startTime:(new Date).getTime(),maxItems:s.DEFAULT_MAX_ITEMS,itemsPerMinute:s.DEFAULT_ITEMS_PER_MIN};var y,E=s.prototype;E._getLogArgs=function(e){for(var r,t,n,i,a,u,c=this.options.logLevel||s.DEFAULT_LOG_LEVEL,l=[],p=0;p<e.length;++p)u=e[p],a=m.typeName(u),"string"===a?r?l.push(u):r=u:"function"===a?i=o(u,this):"date"===a?l.push(u):"error"===a||u instanceof Error||"undefined"!=typeof DOMException&&u instanceof DOMException?t?l.push(u):t=u:"object"===a&&(n?l.push(u):n=u);return l.length&&(n=n||{},n.extraArgs=l),{level:c,message:r,err:t,custom:n,callback:i}},E._route=function(e){var r=this.options.endpoint,t=/\/$/.test(r),n=/^\//.test(e);return t&&n?e=e.substring(1):t||n||(e="/"+e),r+e},E._processShimQueue=function(e){for(var r,t,n,o,i,a,u,c={};t=e.shift();)r=t.shim,n=t.method,o=t.args,i=r.parentShim,u=c[r.shimId],u||(i?(a=c[i.shimId],u=new s(a)):u=this,c[r.shimId]=u),u[n]&&m.isType(u[n],"function")&&u[n].apply(u,o)},E._buildPayload=function(e,r,t,n,o){var i=this.options.accessToken,a=this.options.environment,u=h(!0,{},this.options.payload),c=m.uuid4();if(void 0===s.LEVELS[r])throw new Error("Invalid level");if(!t&&!n&&!o)throw new Error("No message, stack info or custom data");var l={environment:a,endpoint:this.options.endpoint,uuid:c,level:r,platform:"browser",framework:"browser-js",language:"javascript",body:this._buildBody(t,n,o),request:{url:window.location.href,query_string:window.location.search,user_ip:"$remote_ip"},client:{runtime_ms:e.getTime()-window._globalRollbarOptions.startTime,timestamp:Math.round(e.getTime()/1e3),javascript:{browser:window.navigator.userAgent,language:window.navigator.language,cookie_enabled:window.navigator.cookieEnabled,screen:{width:window.screen.width,height:window.screen.height},plugins:this._getBrowserPlugins()}},server:{},notifier:{name:"rollbar-browser-js",version:s.NOTIFIER_VERSION}};u.body&&delete u.body;var p={access_token:i,data:h(!0,l,u)};return this._scrub(p.data),p},E._buildBody=function(e,r,t){var n;return n=r?l(e,r,t):c(e,t)},E._getBrowserPlugins=function(){if(!this._browserPlugins){var e,r,t=window.navigator.plugins||[],n=t.length,o=[];for(r=0;n>r;++r)e=t[r],o.push({name:e.name,description:e.description});this._browserPlugins=o}return this._browserPlugins},E._scrub=function(e){function r(e,r,t,n,o,i){return r+m.redact(i)}function t(e){var t;if(m.isType(e,"string"))for(t=0;t<s.length;++t)e=e.replace(s[t],r);return e}function n(e,r){var t;for(t=0;t<a.length;++t)if(a[t].test(e)){r=m.redact(r);break}return r}function o(e,r){var o=n(e,r);return o===r?t(o):o}var i=this.options.scrubFields,a=this._getScrubFieldRegexs(i),s=this._getScrubQueryParamRegexs(i);return m.traverse(e,o),e},E._getScrubFieldRegexs=function(e){for(var r,t=[],n=0;n<e.length;++n)r="\\[?(%5[bB])?"+e[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",t.push(new RegExp(r,"i"));return t},E._getScrubQueryParamRegexs=function(e){for(var r,t=[],n=0;n<e.length;++n)r="\\[?(%5[bB])?"+e[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",t.push(new RegExp("("+r+"=)([^&\\n]+)","igm"));return t},E._urlIsWhitelisted=function(e){var r,t,n,o,i,a,s,u,c,l;try{if(r=this.options.hostWhiteList,t=e&&e.data&&e.data.body&&e.data.body.trace,!r||0===r.length)return!0;if(!t)return!0;for(s=r.length,i=t.frames.length,c=0;i>c;c++){if(n=t.frames[c],o=n.filename,!m.isType(o,"string"))return!0;for(l=0;s>l;l++)if(a=r[l],u=new RegExp(a),u.test(o))return!0}}catch(p){return this.configure({hostWhiteList:null}),console.error("[Rollbar]: Error while reading your configuration's hostWhiteList option. Removing custom hostWhiteList.",p),!0}return!1},E._messageIsIgnored=function(e){var r,t,n,o,i,a,s;try{if(i=!1,n=this.options.ignoredMessages,s=e&&e.data&&e.data.body&&e.data.body.trace,!n||0===n.length)return!1;if(!s)return!1;for(r=s.exception.message,o=n.length,t=0;o>t&&(a=new RegExp(n[t],"gi"),!(i=a.test(r)));t++);}catch(u){this.configure({ignoredMessages:null}),console.error("[Rollbar]: Error while reading your configuration's ignoredMessages option. Removing custom ignoredMessages.")}return i},E._enqueuePayload=function(e,r,t,n){var o={callback:n,accessToken:this.options.accessToken,endpointUrl:this._route("item/"),payload:e},a=function(){if(n){var e="This item was not sent to Rollbar because it was ignored. This can happen if a custom checkIgnore() function was used or if the item's level was less than the notifier' reportLevel. See https://rollbar.com/docs/notifier/rollbar.js/configuration for more details.";n(null,{err:0,result:{id:null,uuid:null,message:e}})}};if(this._internalCheckIgnore(r,t,e))return void a();try{if(m.isType(this.options.checkIgnore,"function")&&this.options.checkIgnore(r,t,e))return void a()}catch(s){this.configure({checkIgnore:null}),console.error("[Rollbar]: Error while calling custom checkIgnore() function. Removing custom checkIgnore().",s)}if(this._urlIsWhitelisted(e)&&!this._messageIsIgnored(e)){if(this.options.verbose){if(e.data&&e.data.body&&e.data.body.trace){var u=e.data.body.trace,c=u.exception.message;console.error("[Rollbar]: ",c)}console.info("[Rollbar]: ",o)}m.isType(this.options.logFunction,"function")&&this.options.logFunction(o);try{m.isType(this.options.transform,"function")&&this.options.transform(e)}catch(s){this.configure({transform:null}),console.error("[Rollbar]: Error while calling custom transform() function. Removing custom transform().",s)}this.options.enabled&&(window._rollbarPayloadQueue.push(o),i())}},E._internalCheckIgnore=function(e,r,t){var n=r[0],o=s.LEVELS[n]||0,i=s.LEVELS[this.options.reportLevel]||0;if(i>o)return!0;var a=this.options?this.options.plugins:{};if(a&&a.jquery&&a.jquery.ignoreAjaxErrors)try{return!!t.data.body.message.extra.isAjax}catch(u){return!1}return!1},E._log=function(e,r,t,n,o,i,a){var s=null;if(t)try{if(s=t._savedStackTrace?t._savedStackTrace:g.parse(t),t===this.lastError)return;this.lastError=t}catch(u){console.error("[Rollbar]: Error while parsing the error object.",u),r=t.message||t.description||r||String(t),t=null}var c=this._buildPayload(new Date,e,r,s,n);a&&(c.ignoreRateLimit=!0),this._enqueuePayload(c,i?!0:!1,[e,r,t,n],o)},E.log=u(),E.debug=u("debug"),E.info=u("info"),E.warn=u("warning"),E.warning=u("warning"),E.error=u("error"),E.critical=u("critical"),E.uncaughtError=o(function(e,r,t,n,o,i){if(i=i||null,o&&m.isType(o,"error"))return void this._log(this.options.uncaughtErrorLevel,e,o,i,null,!0);if(r&&m.isType(r,"error"))return void this._log(this.options.uncaughtErrorLevel,e,r,i,null,!0);var a={url:r||"",line:t};a.func=g.guessFunctionName(a.url,a.line),a.context=g.gatherContext(a.url,a.line);var s={mode:"onerror",message:o?String(o):e||"uncaught exception",url:document.location.href,stack:[a],useragent:navigator.userAgent},u=this._buildPayload(new Date,this.options.uncaughtErrorLevel,e,s,i);this._enqueuePayload(u,!0,[this.options.uncaughtErrorLevel,e,r,t,n,o])}),E.global=o(function(e){e=e||{};var r={startTime:e.startTime,maxItems:e.maxItems,itemsPerMinute:e.itemsPerMinute};h(!0,window._globalRollbarOptions,r),void 0!==e.maxItems&&(_=0),void 0!==e.itemsPerMinute&&(L=0)}),E.configure=o(function(e,r){var t=h(!0,{},e);h(!r,this.options,t),this.global(t)}),E.scope=o(function(e){var r=new s(this);return h(!0,r.options.payload,e),r}),E.wrap=function(e,r){try{var t;if(t=m.isType(r,"function")?r:function(){return r||{}},!m.isType(e,"function"))return e;if(e._isWrap)return e;if(!e._wrapped){e._wrapped=function(){try{return e.apply(this,arguments)}catch(r){throw r.stack||(r._savedStackTrace=g.parse(r)),r._rollbarContext=t()||{},r._rollbarContext._wrappedSource=e.toString(),window._rollbarWrappedError=r,r}},e._wrapped._isWrap=!0;for(var n in e)e.hasOwnProperty(n)&&(e._wrapped[n]=e[n])}return e._wrapped}catch(o){return e}},E.loadFull=function(){console.error("[Rollbar]: Unexpected Rollbar.loadFull() called on a Notifier instance")},s.processPayloads=function(e){return e?void p():void i()};var x=(new Date).getTime(),_=0,L=0;e.exports={Notifier:s,setupJSON:n,topLevelNotifier:a}},function(e,r){"use strict";var t=Object.prototype.hasOwnProperty,n=Object.prototype.toString,o=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===n.call(e)},i=function(e){if(!e||"[object Object]"!==n.call(e))return!1;var r=t.call(e,"constructor"),o=e.constructor&&e.constructor.prototype&&t.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!r&&!o)return!1;var i;for(i in e);return"undefined"==typeof i||t.call(e,i)};e.exports=function a(){var e,r,t,n,s,u,c=arguments[0],l=1,p=arguments.length,f=!1;for("boolean"==typeof c?(f=c,c=arguments[1]||{},l=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});p>l;++l)if(e=arguments[l],null!=e)for(r in e)t=c[r],n=e[r],c!==n&&(f&&n&&(i(n)||(s=o(n)))?(s?(s=!1,u=t&&o(t)?t:[]):u=t&&i(t)?t:{},c[r]=a(f,u,n)):"undefined"!=typeof n&&(c[r]=n));return c}},function(e,r,t){"use strict";function n(){return l}function o(){return null}function i(e){var r={};return r._stackFrame=e,r.url=e.fileName,r.line=e.lineNumber,r.func=e.functionName,r.column=e.columnNumber,r.args=e.args,r.context=o(r.url,r.line),r}function a(e){function r(){var r=[];try{r=c.parse(e)}catch(t){r=[]}for(var n=[],o=0;o<r.length;o++)n.push(new i(r[o]));return n}return{stack:r(),message:e.message,name:e.name}}function s(e){return new a(e)}function u(e){if(!e)return["Unknown error. There was no error message to display.",""];var r=e.match(p),t="(unknown)";return r&&(t=r[r.length-1],e=e.replace((r[r.length-2]||"")+t+":",""),e=e.replace(/(^[\s]+|[\s]+$)/g,"")),[t,e]}var c=t(5),l="?",p=new RegExp("^(([a-zA-Z0-9-_$ ]*): *)?(Uncaught )?([a-zA-Z0-9-_$ ]*): ");e.exports={guessFunctionName:n,guessErrorClass:u,gatherContext:o,parse:s,Stack:a,Frame:i}},function(e,r,t){var n,o,i;!function(a,s){"use strict";o=[t(6)],n=s,i="function"==typeof n?n.apply(r,o):n,!(void 0!==i&&(e.exports=i))}(this,function(e){"use strict";function r(e,r,t){if("function"==typeof Array.prototype.map)return e.map(r,t);for(var n=new Array(e.length),o=0;o<e.length;o++)n[o]=r.call(t,e[o]);return n}function t(e,r,t){if("function"==typeof Array.prototype.filter)return e.filter(r,t);for(var n=[],o=0;o<e.length;o++)r.call(t,e[o])&&n.push(e[o]);return n}var n=/(^|@)\S+\:\d+/,o=/^\s*at .*(\S+\:\d+|\(native\))/m,i=/^(eval@)?(\[native code\])?$/;return{parse:function(e){if("undefined"!=typeof e.stacktrace||"undefined"!=typeof e["opera#sourceloc"])return this.parseOpera(e);if(e.stack&&e.stack.match(o))return this.parseV8OrIE(e);if(e.stack)return this.parseFFOrSafari(e);throw new Error("Cannot parse given Error object")},extractLocation:function(e){if(-1===e.indexOf(":"))return[e];var r=e.replace(/[\(\)\s]/g,"").split(":"),t=r.pop(),n=r[r.length-1];if(!isNaN(parseFloat(n))&&isFinite(n)){var o=r.pop();return[r.join(":"),o,t]}return[r.join(":"),t,void 0]},parseV8OrIE:function(n){var i=t(n.stack.split("\n"),function(e){return!!e.match(o)},this);return r(i,function(r){r.indexOf("(eval ")>-1&&(r=r.replace(/eval code/g,"eval").replace(/(\(eval at [^\()]*)|(\)\,.*$)/g,""));var t=r.replace(/^\s+/,"").replace(/\(eval code/g,"(").split(/\s+/).slice(1),n=this.extractLocation(t.pop()),o=t.join(" ")||void 0,i="eval"===n[0]?void 0:n[0];return new e(o,void 0,i,n[1],n[2],r)},this)},parseFFOrSafari:function(n){var o=t(n.stack.split("\n"),function(e){return!e.match(i)},this);return r(o,function(r){if(r.indexOf(" > eval")>-1&&(r=r.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g,":$1")),-1===r.indexOf("@")&&-1===r.indexOf(":"))return new e(r);var t=r.split("@"),n=this.extractLocation(t.pop()),o=t.shift()||void 0;return new e(o,void 0,n[0],n[1],n[2],r)},this)},parseOpera:function(e){return!e.stacktrace||e.message.indexOf("\n")>-1&&e.message.split("\n").length>e.stacktrace.split("\n").length?this.parseOpera9(e):e.stack?this.parseOpera11(e):this.parseOpera10(e)},parseOpera9:function(r){for(var t=/Line (\d+).*script (?:in )?(\S+)/i,n=r.message.split("\n"),o=[],i=2,a=n.length;a>i;i+=2){var s=t.exec(n[i]);s&&o.push(new e(void 0,void 0,s[2],s[1],void 0,n[i]))}return o},parseOpera10:function(r){for(var t=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,n=r.stacktrace.split("\n"),o=[],i=0,a=n.length;a>i;i+=2){var s=t.exec(n[i]);s&&o.push(new e(s[3]||void 0,void 0,s[2],s[1],void 0,n[i]))}return o},parseOpera11:function(o){var i=t(o.stack.split("\n"),function(e){return!!e.match(n)&&!e.match(/^Error created at/)},this);return r(i,function(r){var t,n=r.split("@"),o=this.extractLocation(n.pop()),i=n.shift()||"",a=i.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^\)]*\)/g,"")||void 0;i.match(/\(([^\)]*)\)/)&&(t=i.replace(/^[^\(]+\(([^\)]*)\)$/,"$1"));var s=void 0===t||"[arguments not available]"===t?void 0:t.split(",");return new e(a,s,o[0],o[1],o[2],r)},this)}}})},function(e,r,t){var n,o,i;!function(t,a){"use strict";o=[],n=a,i="function"==typeof n?n.apply(r,o):n,!(void 0!==i&&(e.exports=i))}(this,function(){"use strict";function e(e){return!isNaN(parseFloat(e))&&isFinite(e)}function r(e,r,t,n,o,i){void 0!==e&&this.setFunctionName(e),void 0!==r&&this.setArgs(r),void 0!==t&&this.setFileName(t),void 0!==n&&this.setLineNumber(n),void 0!==o&&this.setColumnNumber(o),void 0!==i&&this.setSource(i)}return r.prototype={getFunctionName:function(){return this.functionName},setFunctionName:function(e){this.functionName=String(e)},getArgs:function(){return this.args},setArgs:function(e){if("[object Array]"!==Object.prototype.toString.call(e))throw new TypeError("Args must be an Array");this.args=e},getFileName:function(){return this.fileName},setFileName:function(e){this.fileName=String(e)},getLineNumber:function(){return this.lineNumber},setLineNumber:function(r){if(!e(r))throw new TypeError("Line Number must be a Number");this.lineNumber=Number(r)},getColumnNumber:function(){return this.columnNumber},setColumnNumber:function(r){if(!e(r))throw new TypeError("Column Number must be a Number");this.columnNumber=Number(r)},getSource:function(){return this.source},setSource:function(e){this.source=String(e)},toString:function(){var r=this.getFunctionName()||"{anonymous}",t="("+(this.getArgs()||[]).join(",")+")",n=this.getFileName()?"@"+this.getFileName():"",o=e(this.getLineNumber())?":"+this.getLineNumber():"",i=e(this.getColumnNumber())?":"+this.getColumnNumber():"";return r+t+n+o+i}},r})},function(e,r,t){"use strict";function n(e){return{}.toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function o(e,r){return n(e)===r}function i(e){if(!o(e,"string"))throw new Error("received invalid input");for(var r=l,t=r.parser[r.strictMode?"strict":"loose"].exec(e),n={},i=14;i--;)n[r.key[i]]=t[i]||"";return n[r.q.name]={},n[r.key[12]].replace(r.q.parser,function(e,t,o){t&&(n[r.q.name][t]=o)}),n}function a(e){var r=i(e);return""===r.anchor&&(r.source=r.source.replace("#","")),e=r.source.replace("?"+r.query,"")}function s(e,r){var t,n,i,a=o(e,"object"),u=o(e,"array"),c=[];if(a)for(t in e)e.hasOwnProperty(t)&&c.push(t);else if(u)for(i=0;i<e.length;++i)c.push(i);for(i=0;i<c.length;++i)t=c[i],n=e[t],a=o(n,"object"),u=o(n,"array"),a||u?e[t]=s(n,r):e[t]=r(t,n);return e}function u(e){return e=String(e),new Array(e.length+1).join("*")}function c(){var e=(new Date).getTime(),r="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(r){var t=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===r?t:7&t|8).toString(16)});return r}t(8);var l={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}},p={isType:o,parseUri:i,parseUriOptions:l,redact:u,sanitizeUrl:a,traverse:s,typeName:n,uuid4:c};e.exports=p},function(e,r){!function(e){"use strict";e.console=e.console||{};for(var r,t,n=e.console,o={},i=function(){},a="memory".split(","),s="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");r=a.pop();)n[r]||(n[r]=o);for(;t=s.pop();)n[t]||(n[t]=i)}("undefined"==typeof window?this:window)},function(e,r,t){"use strict";function n(e){i=e}var o=t(7),i=null,a={XMLHttpFactories:[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],createXMLHTTPObject:function(){var e,r=!1,t=a.XMLHttpFactories,n=t.length;for(e=0;n>e;e++)try{r=t[e]();break}catch(o){}return r},post:function(e,r,t,n){if(!o.isType(t,"object"))throw new Error("Expected an object to POST");t=i.stringify(t),n=n||function(){};var s=a.createXMLHTTPObject();if(s)try{try{var u=function(){try{u&&4===s.readyState&&(u=void 0,200===s.status?n(null,i.parse(s.responseText)):n(o.isType(s.status,"number")&&s.status>=400&&s.status<600?new Error(String(s.status)):new Error))}catch(e){var r;r=e&&e.stack?e:new Error(e),n(r)}};s.open("POST",e,!0),s.setRequestHeader&&(s.setRequestHeader("Content-Type","application/json"),s.setRequestHeader("X-Rollbar-Access-Token",r)),s.onreadystatechange=u,s.send(t)}catch(c){if("undefined"!=typeof XDomainRequest){"http:"===window.location.href.substring(0,5)&&"https"===e.substring(0,5)&&(e="http"+e.substring(5));var l=function(){n(new Error("Request timed out"))},p=function(){n(new Error("Error during request"))},f=function(){n(null,i.parse(s.responseText))};s=new XDomainRequest,s.onprogress=function(){},s.ontimeout=l,s.onerror=p,s.onload=f,s.open("POST",e,!0),s.send(t)}}}catch(d){n(d)}}};e.exports={XHR:a,setupJSON:n}}]);
  /* jshint ignore:end */

  Rollbar = window.Rollbar.init({
    accessToken: '3cddb790e27342ad86f431498a1f8342',
    captureUncaught: true,
    scrubFields: [],
    reportLevel: 'debug',
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: "VERSIONSTRING",
          guess_uncaught_frames: true
        }
      }
    }
  })
  if(Rollbar) {
    if(location.href.indexOf('api.razorpay.com') < 0) {
      Rollbar.configure({
        enabled: false,
        verbose: true
      });
    }
    roll = function(message, data, level) {
      if(!level){
        level = 'error';
      }
      setTimeout(function(){
        if(data){
          Rollbar[level](message, data);
        }
        else{
          Rollbar[level](message);
        }
      })
    }
  }
} catch(e){}
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
/**
* Simple wrapper component around `window.open()`.
* https://github.com/component/popup
*
* Usage:
*
*     var win = new Popup('http://google.com', { width: 100, height: 100 });
*     win.on('close', function () {
*       console.log('popup window was closed');
*     });
*/

/**
* Default Popup options.
*/

var _popCheckClose = function(popup) {
  return function () {
    popup._checkClose();
  }
};

function getPopupDimension(varVal, minVal, maxVal){
  return Math.min(
    Math.max(
      Math.floor(varVal),
      minVal
    ),
    maxVal
  )
}

/**
* The "Popup" constructor.
*/

var Popup = function(src, name) {
  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;

  var opts = {
    width: getPopupDimension(width*0.6, 720, 1440),
    height: getPopupDimension(height*0.75, 520, 1060),
    menubar: 'no',
    resizable: 'yes',
    location: 'no',
    scrollbars: 'yes'
  };

  // we try to place it at the center of the current window
  // note: this "centering" logic borrowed from the Facebook JavaScript SDK
  var screenX = null === window.screenX ? window.screenLeft : window.screenX;
  var screenY = null === window.screenY ? window.screenTop : window.screenY;
  var outerWidth = null === window.outerWidth ? document.documentElement.clientWidth : window.outerWidth;
  var outerHeight = null === window.outerHeight ? (document.documentElement.clientHeight - 22) : window.outerHeight;

  opts.left = parseInt(screenX + ((outerWidth - opts.width) / 2), 10);
  opts.top = parseInt(screenY + ((outerHeight - opts.height) / 2.5), 10);

  // turn the "opts" object into a window.open()-compatible String
  var optsStr = [];
  each(opts, function(key, val){
    optsStr.push(key + '=' + val);
  })
  optsStr = optsStr.join(',');

  this.name = name;
  // finally, open and return the popup window
  this.window = window.open(src, (name || ''), optsStr); // might be null in IE9 if protected mode is turned on

  if(!this.window){
    return null;
  }

  this.window.focus();
  this.listeners = [];
  this.interval = setInterval(_popCheckClose(this), 300);

  this.on('beforeunload', this.beforeunload);
  this.on('unload', this.close);
}

Popup.prototype = {

  on: function(event, func){
    this.listeners.push(
      $(window).on(event, func, false, this)
    );
  },

  beforeunload: function(e){
    e.returnValue = 'Your payment is incomplete.';
    return e.returnValue;
  },

/**
* Closes the popup window.
*/

  close: function () {
    clearInterval(this.interval);
    invokeEach(this.listeners);
    this.listeners = [];

    try{
      this.window.close();
    }
    catch(e){
      roll('Failure closing popup window', null, 'warn');
    }
  },

/**
* Emits the "close" event.
*/

  _checkClose: function (forceClosed) {
    try {
      if (forceClosed || this.window.closed !== false ) { // UC browser makes it undefined instead of true
        invoke('onClose', this, null, 300);
        this.close();
      }
    }
    catch(e){ // UC throws error on accessing window if other domain
      this._checkClose(true);
      roll('Failure checking popup close', null, 'warn');
    }
  }
}
var _$objectToURI = function(obj) {
  var data = [];
  var encode = window.encodeURIComponent;
  each( obj, function( key, val ) {
    data.push(encode(key) + '=' + encode(val));
  })
  return data.join('&');
};

var _$getAjaxParams = function(options){
  var params = {
    data: options.data || {},
    error: options.error || noop,
    success: options.success || noop,
    complete: options.complete || noop,
    url: options.url || ''
  }

  var url = params.url;
  url += params.url.indexOf('?') < 0 ? '?' : '&';
  url += _$objectToURI(params.data);
  params.computedUrl = url;
  return params;
};

var _$randomString = function(length) {
  var str = '';
  while(str.length < length) { str += Math.random().toString(36)[2] }
  return str
};

$.jsonp = function(options){
  if(!options.data) { options.data = {} }

  var callback = options.data.callback = 'jsonp_' + _$randomString(15);
  var params = _$getAjaxParams(options);
  var done = false;
  
  window[callback] = function(data){
    params.success(data, params);
    params.complete(data, params);
    try {
      delete window[callback]
    }
    catch(e){
      window[callback] = undefined;
    }
  }
  
  var script = document.createElement('script');
  script.src = params.computedUrl;
  script.async = true;

  script.onerror = function(e){
    params.error({ error: true, url: script.src, event: e });
    params.complete({ error: true, url: script.src, event: e }, params);
  }

  script.onload = script.onreadystatechange = function(){
    if(!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')){
      done = true;
      script.onload = script.onreadystatechange = null;
      $(script).remove();
      script = null;
    }
  }
  var head = document.documentElement;
  head.appendChild(script);
};
var templates = {};
var cookieInterval;

function makeFormHtml64(url, data){
  return _btoa('<form action="'+url+'" method="post">'+deserialize(data)+'</form><script>document.forms[0].submit()</script>');
}

function clearCookieInterval(){
  if(cookieInterval){
    deleteCookie('onComplete');
    clearInterval(cookieInterval);
    cookieInterval = null;
  }
}

function deleteCookie(name){
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
}

function setCookie(name, value){
  document.cookie = name + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
}

function getCookie(name){
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for( var i=0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
}

var communicator;
function setCommunicator(){
  var baseCommUrl = discreet.makeUrl(true);
  if (location.href.indexOf(baseCommUrl) && (/MSIE |Windows Phone|Trident\//.test(ua))) {
    communicator = document.createElement('iframe');
    communicator.style.display = 'none';
    doc.appendChild(communicator);
    communicator.src = discreet.makeUrl(true) + 'communicator.php';
  }
}
setCommunicator();

function cookiePoll(request){
  deleteCookie('onComplete');

  cookieInterval = setInterval(function(){
    var cookie = getCookie('onComplete');
    if(cookie){
      clearCookieInterval();
      request.complete(cookie);
    }
  }, 150)
}

function onMessage(e){
  if (
    e.origin
    && this.popup
    && (e.source === this.popup.window || e.source === communicator.contentWindow)
  ) {
    this.complete(e.data);
  }
}

// this === request
function ajaxCallback(response){
  this.payment_id = response.payment_id;

  if(response.razorpay_payment_id || response.error){
    this.complete(response);
  } else {
    var nextRequest = response.request;
    if(response.type === 'otp'){
      this.secondfactor(makeSecondfactorCallback(this, nextRequest));
    } else {
      this.nextRequest(nextRequest);
    }
  }
}

function makeSecondfactorCallback(request, nextRequest){
  return function(factor){
    $.post({
      url: nextRequest.url,
      data: {
        type: 'otp',
        otp: factor
      },
      callback: request.ajaxCallback
    })
  }
}

function Request(params){
  if(!(this instanceof Request)){
    return new Request(params);
  }

  var errors = this.format(params);
  if(errors){
    return errors;
  }

  var popup,
    options = this.options,
    data = this.data,
    url = this.makeUrl();

  if(options.redirect){
    // add callback_url if redirecting
    if(options.callback_url){
      data.callback_url = options.callback_url;
    }
    return discreet.redirect({
      url: url,
      content: data,
      method: 'post'
    });
  }

  if(!discreet.supported(true)){
    return true;
  }
  if(this.shouldPopup()){
    popup = this.makePopup();
    // open new tab
    if(!popup){
      localStorage.removeItem('payload');
      submitForm(discreet.makeUrl(true) + 'submitPayload.php', null, null, '_blank');
    }
  } else {
    data['_[source]'] = 'checkoutjs';
  }

  if(this.shouldAjax()){
    this.makeAjax();
  } else {
    localStorage.setItem('payload', makeFormHtml64(url, data));
    submitForm(url, data, 'post', popup.name);
  }

  // adding listeners
  if(discreet.isFrame){
    window.onComplete = bind(this.complete, this);
  }
  this.listener = $(window).on('message', bind(onMessage, this));
  cookiePoll(this);
}

Request.prototype = {

  format: function(params){
    if(typeof params !== 'object' || typeof params.data !== 'object'){
      return err('malformed payment request object');
    }

    var data = this.data = params.data;
    this.options = params.options || emo;
    this.fees = params.fees;
    this.success = params.success || noop;
    this.error = params.error || noop;
    if(params.secondfactor){
      this.secondfactor = params.secondfactor;
    }

    if(!data.key_id){
      data.key_id = Razorpay.defaults.key;
    }
    if(!data.currency){
      data.currency = Razorpay.defaults.currency;
    }

    data['_[id]'] = _uid;
    data['_[medium]'] = discreet.medium;
    data['_[context]'] = discreet.context;
    data['_[checkout]'] = !!discreet.isFrame;

    return Razorpay.payment.validate(data);
  },

  makeUrl: function(){
    var urlType;
    if(this.fees){
      urlType = 'fees';
    } else if(!this.options.redirect && this.shouldAjax()){
      urlType = 'ajax';
    } else {
      urlType = 'checkout';
    }
    return discreet.makeUrl() + 'payments/create/' + urlType;
  },

  makeAjax: function(){
    var cb = this.ajaxCallback = bind(ajaxCallback, this);
    var data = this.data;
    var url = this.makeUrl() + '?key_id=' + data.key_id;
    delete data.key_id;

    $.post({
      url: url,
      data: data,
      callback: cb
    })
  },

  nextRequest: function(request){
    var direct = request.method === 'direct';
    var content = request.content;
    if(this.popup){
      if(direct){
        this.writePopup(content);
      } else {
        submitForm(
          request.url,
          request.content,
          request.method,
          this.popup.name
        )
      }
    } else {
      var payload = direct ? _btoa(content) : makeFormHtml64(request.url, content);
      localStorage.setItem('payload', payload);
    }
  },

  shouldPopup: function(){
    return !discreet.isFrame || this.fees || (this.data.wallet !== 'mobikwik' && this.data.wallet !== 'payumoney');
  },

  shouldAjax: function(){
    return discreet.isFrame && !this.fees && !communicator;
  },

  shouldPost: function(){
    return (this.shouldPopup() && !this.popup) || !this.shouldAjax();
  },

  makePopup: function(){
    if(/(Windows Phone|\(iP.+UCBrowser\/)/.test(ua)) {
      return null;
    }
    var popup;
    try{
      popup = this.popup = new Popup('', 'popup_' + _uid);
    } catch(e){
      return null;
    }
    try{
      this.writePopup();
    } catch(e){}

    popup.onClose = bind(this.cancel, this);
    return popup;
  },

  writePopup: function(html){
    var pdoc = this.popup.window.document;
    pdoc.write(html || templates.popup(this));
    pdoc.close();
  },

  cancel: function(errorObj){
    if(!this.done){
      var payment_id = this.payment_id;
      if(payment_id){
        $.ajax({
          url: discreet.makeUrl() + 'payments/' + payment_id + '/cancel',
          headers: {
            Authorization: 'Basic ' + _btoa(this.options.key + ':')
          }
        })
      }
      this.complete(errorObj || discreet.defaultError());
    }
  },

  complete: function(data){
    if(this.done){
      return;
    }
    this.clear();
    try{
      if(typeof data !== 'object') {
        data = JSON.parse(data);
      }
    }
    catch(e){
      return roll('unexpected api response', data);
    }

    var payment_id = data.razorpay_payment_id;
    if(typeof payment_id === 'string' && payment_id){
      var returnObj = 'signature' in data ? data : { razorpay_payment_id: data.razorpay_payment_id };
      return invoke(this.success, null, returnObj, 0); // dont expose request as this
    }

    if(!data.error || typeof data.error !== 'object' || !data.error.description){
      data = {error: {description: 'Unexpected error. This incident has been reported to admins.'}};
    }
    invoke(this.error, null, data, 0);
  },

  clear: function(){
    try{
      this.popup.onClose = null;
      this.popup.close();
    } catch(e){}

    this.done = true;
    // unbind listener
    invoke('listener', this);
    clearCookieInterval();
  },

  track: function(){
    var data = this.data;
    var trackingPayload = this.trackingPayload = {};
    each(
      [
        'email',
        'contact',
        'method',
        'card[name]',
        'bank',
        'wallet',
        'emi_duration'
      ],
      function(i, key){
        if(key in data){
          trackingPayload[key] = data[key];
        }
      }
    )
  }
}

Razorpay.payment = {
  authorize: Request,
  validate: function(data){
    var errors = [];

    if (!isValidAmount(data.amount)) {
      errors.push({
        description: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (!data.method){
      errors.push({
        description: 'Payment Method not specified',
        field: 'method'
      });
    }

    if (typeof data.key_id === 'undefined') {
      errors.push({
        description: 'No merchant key specified',
        field: 'key'
      });
    }

    if (data.key_id === '') {
      errors.push({
        description: 'Merchant key cannot be empty',
        field: 'key'
      });
    }

    return err(errors);
  },

  getPrefs: function(key, callback){
    return $.jsonp({
      url: discreet.makeUrl() + 'preferences',
      data: {key_id: key},
      timeout: 30000,
      success: function(response){
        invoke(callback, null, response);
      }
    });
  },

  getMethods: function(callback){
    return Razorpay.payment.getPrefs(Razorpay.defaults.key, function(response){
      callback(response.methods);
    })
  }
};

/* jshint ignore:start */

(function(){function theme(it) {
var out=''; var c = it('theme.color'), frame = it('theme.image_padding'), close = it('theme.close_btn'); out+='.tab .footer, .btn{ background: '+(c)+';}.spin div{ border-color: '+(c)+'!important;}#tab-wallet input:checked+label:after,#payment-options i{ color: '+(c)+';}#header{ background: '+(c)+';}#header:before{ content: ""; width: 100%; height: 100%; position: absolute; background-image: linear-gradient(to bottom right, rgba(255,255,255,.2), rgba(0,0,0,.2));}.link{ color: '+(c)+'}.merchant-image{ width: 60px; height: 60px; padding: 12px; border: 1px solid #eaeaea; background: #fff;}.option.active,.checked .checkbox,input[type=checkbox]:checked + .checkbox{ color: #fff; background: '+(c)+'; border-color: '+(c)+';}';if(close){out+='#modal-close{ display: none;}';}out+='.grid :checked+label:before { content: ""; position: absolute; width: 100%; height: 3px; border-bottom: 2px solid '+(c)+'; bottom: -1px; z-index: 1; left: 0;}#paybutton:before{ content: ""; width: 100%; height: 100%; position: absolute; background-image: linear-gradient(to bottom right, rgba(255,255,255,.2), rgba(0,0,0,.2));}';return out;
}var itself=theme, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {templates=templates||{};templates['theme']=itself;}}());

/* jshint ignore:end */
/* jshint ignore:start */

(function(){function modal(it) {
var out='';var o = it.get, method = it.methods, wallet = method.wallet, wd = it.walletData,html = function(html){return html.replace(/<[^>]*>?/g, "")},attr = function(attr){return attr.replace(/"/g,'')};var amount;if(o('display_currency')) amount = it.currencies[o('display_currency')] + html(o('display_amount'));else amount = "<i>&#xe600;</i><span class='iph'>₹</span>" + (o('amount')/100).toFixed(2).replace(".00", "");var i = 0;var gridClasses = ['single','double',''];var methods = ['card', 'netbanking', 'wallet'];for(var m in methods) { if(method[methods[m]]) i++;}var gridClass = gridClasses[i-1];out+='<div id="container" class="mfix animations" tabIndex="0"> <div id="backdrop"></div> <div id="modal" class="mchild"> <i id="powered-by"><a id="powered-link" href="https://razorpay.com" target="_blank">&#xe608;</a></i> <div id="modal-inner"> <div id="overlay" class="showable"></div> <div id="emi-wrap" class="showable mfix"></div> <div id="error-message" class="showable"> <div class="spin"><div></div></div> <div class="spin spin2"><div></div></div> <div id="fd-t"></div> <button id="fd-hide" class="btn">Retry</button> </div> <div id="content"> <div id="header"> <div id="close" class="close">×</div> ';if(o('image')){out+=' <div id="logo"> <img src="'+(attr(o('image')))+'"> </div> ';}out+=' <div id="merchant"> ';if(o('name')){out+=' <div id="merchant-name">'+(html(o('name')))+'</div> ';}out+=' <div id="merchant-desc">'+(html(o('description')))+'</div> <div id="amount">'+(amount)+'</div> </div> <div class="clear"></div> </div> <div id="body"> <section id="topbar-wrap"> <div id="topbar" class="stackable"> <div id="user"></div> <i class="back">&#xe604;</i> <div id="tab-title"></div> </div> </section> <form id="form" class="showable shown" method="POST" novalidate autocomplete="off" onsubmit="return false"> <div id="form-fields"> <div id="form-common" class="stackable showable shown"> <div class="pad"> <div class="elem-wrap"><div class="elem elem-contact"> <i>&#xe607;</i> <div class="help">Please enter 10-12 digit contact number</div> <label>Phone</label> <input class="input" id="contact" name="contact" type="tel" required value="'+(attr(o('prefill.contact'))||'+91 ')+'" pattern="^\\+?(91 )?[0-9]{10,14}$" maxlength="15"> </div></div> <div class="elem-wrap"><div class="elem elem-email"> <i>&#xe603;</i> <div class="help">Please enter a valid email. Example:<br> you@example.com</div> <label>Email</label> <input class="input" name="email" type="email" id="email" required value="'+(attr(o('prefill.email')))+'" pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$"> </div></div> </div> <div class="legend">Select payment method</div> <div id="payment-options" class="grid '+(gridClass)+'"> ';if(method.card){out+=' <div class="payment-option item" tab="card"><label><i>&#xe609;</i>'+(it.tab_titles.card)+'</label></div> ';}out+=' ';if(method.netbanking){out+=' <div class="payment-option item" tab="netbanking"><label><i>&#xe60a;</i>'+(it.tab_titles.netbanking)+'</label></div> ';}out+=' ';if(method.wallet){out+=' <div class="payment-option item" tab="wallet"><label><i>&#xe60b;</i>'+(it.tab_titles.wallet)+'</label></div> ';}out+=' </div> <div class="clear"></div> </div> ';if(method.card){out+=' <div class="pad tab-content stackable showable" id="tab-card"> <input type="hidden" name="method" value="card"> <div class="elem-wrap two-third"><div class="elem" id="elem-card"> <label>Card Number</label> <i>&#xe605;</i> <span class="help">Please enter a valid card number</span> <div class="card-image"></div> <input class="input" ignore-input type="tel" id="card_number" name="card[number]" required autocomplete="off" maxlength="19" value="'+(attr(o('prefill.card[number]')))+'"> <label id="nocvv" for="nocvv-check"> <input type="checkbox" id="nocvv-check" checked disabled> <span class="checkbox"></span> My card doesn\'t have expiry/CVV </label> </div></div> <div class="elem-wrap third"><div class="elem elem-expiry"> <label>Expiry</label> <i>&#xe606;</i> <input class="input" type="tel" id="card_expiry" name="card[expiry]" placeholder="MM / YY" required pattern="(0[1-9]|1[0-2]) ?\\/ ?(1[6-9]|[2-9][0-9])" maxlength="7" value="'+(attr(o('prefill.card[expiry]')))+'"> </div></div> <div class="elem-wrap two-third"><div class="elem elem-name"> <label>Card Holder\'s Name</label> <i>&#xe602;</i> <span class="help">Please enter your name</span> <input class="input" type="text" id="card_name" name="card[name]" required value="'+(attr(o('prefill.name')))+'"> </div></div> <div class="elem-wrap third"><div class="elem elem-cvv"> <label>CVV</label> <i>&#xe604;</i> <input class="input" type="password" id="card_cvv" inputmode="numeric" name="card[cvv]" maxlength="3" required pattern="[0-9]{3}"> </div></div> <div id="elem-emi" class="double clear"> <div class="first disabled dropdown-parent" for="emi" tabIndex="0" id="emi-check-label"> <span class="checkbox"></span> Pay with EMI <div id="emi-select" class="select dropdown"> <div id="emi-plans-wrap"></div> <div class="option" value="">Pay without EMI</div> </div> <span class="help dropdown">EMI is available on HDFC & Kotak Credit Cards. Enter your credit card to avail.</span> </div> <div class="second" id="view-emi-plans"> View EMI Plans </div> </div> <label class="elem" for="cardsave" style="display: none"> <input type="checkbox" id="cardsave"> Remember Me </label> </div> ';}out+=' ';if(method.netbanking){out+=' <div class="tab-content stackable showable" id="tab-netbanking"> <input type="hidden" name="method" value="netbanking"> '; var count = 0, max = 3; out+=' <div id="netb-banks" class="clear grid"> '; for(var b in it.netbanks){ if(count === 0){ count = max - 3 + 1; max++; } out+=' <div class="netb-bank item"> <input class="bank-radio" id="bank-radio-'+(b)+'" type="radio" name="bank" value="'+(b)+'"> <label for="bank-radio-'+(b)+'" class="radio-label mfix"> <div class="mchild l-'+(count)+'"> <img src="data:image/png;base64,'+(it.netbanks[b].image)+'"> <div>'+(it.netbanks[b].title)+'</div> </div> </label> </div> '; count = (count + 1) % max; } out+=' </div> <div class=\'pad\'> <div class="elem-wrap"><div id="nb-elem" class="elem select"> <i class="select-arrow">&#xe601;</i> <div class="help">Please select a bank</div> <select id="bank-select" name="bank" required class="input" pattern="[\\w]+"> <option selected="selected" value="">Other Banks</option> ';for(var i in method.netbanking){out+=' <option value="'+(i)+'">'+(method.netbanking[i])+'</option> ';}out+=' </select> </div></div> </div> </div> ';}out+=' '; if(wallet){ out+=' <div class="tab-content stackable showable" id="tab-wallet"> <input type="hidden" name="method" value="wallet"> '; var count = 0, max = 2; out+=' <div id="wallets" class="clear grid double"> '; for (var w in wallet){ if(count === 0){ count = max - 2 + 1; max++; } out+=' <div class="wallet item"> <input type="radio" name="wallet" value="'+(w)+'" id="wallet-radio-'+(w)+'"> <label for="wallet-radio-'+(w)+'" class="radio-label mfix"> <img class="wallet-button colored mchild l-'+(count)+'" style="height:'+(wd[w].h)+'px" src="'+(wd[w].col)+'"> </label> </div> '; count = (count + 1) % max; } out+=' </div> </div> ';}out+=' </div> <div class="footer"> <div class="footer-desc">Amount to pay: '+(amount)+'</div> <button id="submitbtn" class="button" type="submit">PAY '+(amount)+'</button> </div> </form> <form id=\'otp-form\'> <strong id=\'otp-prompt\'></strong> <input type=\'tel\' pattern=\'^[0-9]{6}$\' title=\'Please enter a valid OTP\' name=\'otp\' id=\'otp\' maxlength=\'6\' autocomplete="off" autofocus required> <div class="spin"> <div></div> </div> <div class="spin spin2"> <div></div> </div> <div class="double clear pad"> <span class=\'link first\'></span> <span class=\'link grey second\'></span> </div> <div class="footer"> <button id="otpbtn" class="button" type="submit">Verify</button> </div> </form> </div> </div> </div> </div></div>';return out;
}var itself=modal, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {templates=templates||{};templates['modal']=itself;}}());

/* jshint ignore:end */
/* jshint ignore:start */

(function(){function popup(it) {
var out='<!doctype html><html style="height:100%; width: 100%;"> <head> <title>Processing, Please Wait...</title> <style> #top{ text-align:left;border-bottom:1px solid #ddd;padding-bottom:16px;margin-bottom:-50px } .spin{ width:60px;height:60px;margin:0 auto;margin-bottom:-60px;position:relative;top:-30px } .spin div{ width: 100%; height: 100%; vertical-align: middle; display: inline-block; border-radius: 50%; -webkit-border-radius: 50%; -moz-border-radius: 50%; border: 4px solid #29b7d6; -moz-animation: spin 1.3s linear infinite; -webkit-animation: spin 1.3s linear infinite; animation: spin 1.3s linear infinite; -moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box; opacity: 0 } #spin2 div{ -moz-animation-delay: 0.65s; -webkit-animation-delay: 0.65s; animation-delay: 0.65s; } @-moz-keyframes spin { 0%{-moz-transform:scale(0.5);opacity:0;border-width:8px;} 20%{-moz-transform:scale(0.6);opacity:0.8;border-width:4px;} 90%{-moz-transform:scale(1);opacity:0;} } @-webkit-keyframes spin { 0%{-webkit-transform:scale(0.5);opacity:0;border-width:8px;} 20%{-webkit-transform:scale(0.6);opacity:0.8;border-width:4px;} 90%{-webkit-transform:scale(1);opacity:0;} } @keyframes spin { 0%{transform:scale(0.5);opacity:0;border-width:8px;} 20%{transform:scale(0.6);opacity:0.8;border-width:4px;} 90%{transform:scale(1);opacity:0;} } @media(max-height:480px){ #power{display:none} #top{border:none} } </style> </head> <body onload="sub()" style="overflow:hidden;text-align:center;height:100%;white-space:nowrap;margin:0;padding:0;font-family:ubuntu,verdana,helvetica,sans-serif"> <div style="display:inline-block;vertical-align:middle;width:90%;max-width:600px;height:60%;max-height:440px;position:relative"> <div id="top"> <span style="font-size:44px;float:right;line-height:52px;color:#666">₹'+(it.data.amount/100)+'</span> ';if(it.options.image){out+=' <img src="'+(it.options.image)+'" height="52px"> ';}out+=' </div> <div style="position:relative;top:40%"> <div class="spin"><div></div></div> <div class="spin" id="spin2"><div></div></div> <div style="text-align:center;margin:50px 0 0 10px;font-size:22px;color:#666">Processing Payment</div> </div> <div id="power" style="position:absolute;left:50%;margin-left:-96px;bottom:0"> <div style="position:absolute;font-size:13px;right:0;bottom:34px;letter-spacing:0.25px;color:#888">powered by</div> <img width="192px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAA5CAMAAADurgWFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGBQTFRFUlJSb29v/v7+xcXFKbfWB4O0as3juLi48vLyIyMjoN/tmJiYqampKCgo7Ozs29vbPT09hISEHrPU0dHR4+Pj+Pj4wuvz4vX6FZO/QL/b8Pr8IqnMHx8f+/z8LS0t////NYUSEgAAACB0Uk5T/////////////////////////////////////////wBcXBvtAAAIwUlEQVR42uRaa3ejOAwFkwm4YDAB2rS1yf//l+uHZMvYmbbzaZM6Z87ZBRukq6snrW7fXOxF355xVd/cp88vt18MAHs9Xd5+MQAfL5fT+fZrAbDmf1oCfAOAj/PldLqc2S8FgL0a9Q0ATxoCvwTAmd+sd/0rAWAvF6//8xLgrwCg+c36+IUAgPc7Apxvvw+At2j+08URYKkPa66HYVn1UwIQvD8SgFVK8OOPK7XP4/MBoN+j+icogia1lxdXy9MB8EL1P727IqgWdwDYRcWeDICPd6r/5dVeG/l+d8lnA+A1cQBfBPUAgPF7vxRHSgipnwsA5gnw+UmKoA2VbbrR/bp1kHhtfrIY4Alw/eMBODnzDjx39wZI8WxBkJ0v71b/KyGAlp7vqiEbGwWgWIiY3rp1naZlWpZlmsYtIsXKK+aczp+blrUj+JJ9bLR3GbnEdOfPTF30v1SGNdzJXxmvFQB4MwT4/PMHCOBzIOqaeHtNQZm4yYdk7bKH+mCUVWHJyd/thlqKcEpUeOq2+mNyvG2DtI+uTCniLy2sqSW+jcu6A51mU5kQEbisGh+/QIKeGA/E6AsAnE+fV6O/J8AJiiBI+QPZt4IHeFCyLGlk8XQxYhWWzxxrbcLpoaoAks3KbuM1a3e3g0+3Rfmjg6nJ6Iv2zQuUVSpCVfZW7SVQEYBxd1d4pasCAaz6KQEWfPRGNkJeUEP55ciXrlg/qNbi2qs8uQruONBB0Glrr6yNPgHkwyO9CEbP8ntYJeI7vdP5rUJ2hRjw4tQPBHCGmv0TOOFQUEw4Ava2Tlbc/YJ43N5qSwWEkAZKXcEt7s7hMU8BgFeC8PZqAFnAm/CEJ+Zo7IwyhHfaDMUgXfEJZR/8k/iaB0EG+iMBfBEEb+ak6mdgDu5y4Cbrue+bxgSfpa3D2w0A2qhnawf7T0YrN1F/XvWtOwb6OJi3g5UtYrhBVX1j49yA4HgABivD4GRo+oo8TCMDUHwgtEO6OvaA14QA75QANN8zLIyclW9JgA1GtzlTd2FtLZJGri5k+Qe0eHbACzHqulAiPMuxFuUNHtgk1SyRQWPUskjL1IE36jjVoQf8/EMB8ARAsvMWNBmnVvLE/dIFfVPiMVYpZKyLTK0KEqZp1ZYVQWYlh6nbts3kR4w5bdTyfi8SCNrFHA4pDG7xmR0B+DA9IAJwIqPAIXqU9TLzL8QuNZfagF4EF6OcAaOq3sVGmbEKSWXgWRDfNuRdsJuo4xsXQpnD6ghpdXrSq+OrFwqAdi1gSoAzwdlHX/8LWaYv6Q/MTA2zVXynFgQ4VAwroCGvY9wm9EAzkLKT1TzPTYXdmFBqQk+bAFIA3twI4DMNgR+3e2HcZexqupXKvVblFfIINBT7mtozk9nG6jX3IeQxQXU87CIibJI4R6dIqETrTGkpjBOga04AtMYhv6q9XlAWtg51JcNv3ynHgKxg0qpLtV2OGjqZ0YFJ1qGRGxZGUbdrM5E/ypBU7iPxFAi9MZBUsfy1KgMBLoVJkKAZvmqnyLu1MjWs2EXqIcQz2YDuP+u79myihiBxknUAVrllbm5JpAeTbfejDFC5w+PUFEIvCd0AAExAr3kRhAQQ9TqtPSpHG+BWlWdFQdRthk5CDSzXNmgoQoWE8X7NEwtJOoCq3dVVxXkd7F4jU7xv0UDqAfjw+h8iwBut+F3BF8ZCpCnCPolDHbgf24YRwp+QS2ZPXdKwEO9DLdplOdDs2tBIXoJokLRH0JBdE+es6AzwSnMgTILQ0WbKXJLhVuyJh8mvChImirrsWPCNR4em9sQybyvF+yzexdhsSRRkbLwIGGB6aiLrD7CxO84DNMwAC1Vwl2ocqtE2taWokPBdOiXK3f+gba4hVq40i/bimDRxl+kqMT62xzpkTACo4T/S8qQiM8BrAsCJjgIxp6M6IX2BA8Q+I/VfPaP+A/urPUlEL8T7Lk+aUWvodXjwmM7HwLDbBz7ej0KklSQCADPAEALfyShQplOvKQSBjdohSpb6L1Y/QiRTsyR/HTUsxPtA9+lY6tqYCZO5aNjhsBsYMNeiULtXkQBpFQxFkEpz+hZ61jWxw/HlPr+vIR0lH48KRRDhTSHea5lVFnEXpo/gMfoYQwNtE55EANjZ1/3XxAHSSVCbJiuUL0QAdvBMdyF0dIeXThnHRzJvyON9sHGfRwCNUTg+jUTHxChprCIAvN3PgU02CZo5Nd/IU1tii+vmMNj8iGqMLfEYo3zUZyJdYiE+hM4gXOvqmCjmQ9GAtIspdo7NS5IAEIDz6VSoghntKYdj1gdMwEN22dspxDJgw2M8c4sDKrnzsKxjDgHEtrHDi5oTR7lfBLkD9j1tDZnVDvmwcYZ7zbwf518EAD4VxuLlIuiVVhAi4hZKIRdiwpDOD2M5GcMM6u5nxEBJQU9xp38h3pN5qx/64mtUreO0Cu5ho05tHc6rtvRd4KVUBd+dBIVJhWUFO46C0Rob7aGTHmohE7b0jh9u5/H+7ldJX1lM6d1gkTzFZgMaD8CHM/gpToIu5Huo7ysoHe3o1V31XZtKptODnxjYqtE2CIWfj+NDnGf6JMmV9HMug6/fx/I5Sc+TXhxOdLQT4aqeQeYxY1CWADwAL6d3uz6vfrn/wUmQkHbtydSn9RfNMhbb6l1511Zc9nqBe6Phxi4LSwAH17myR/w3ViVNGc0w3vt9pAjakIZ6DmeEnBeMcYvk+CRRL7oCmbPpWNIBEAC0Zu6n4Z/7eXE0rAQ4ppPL27q0ZvkvVCzcYZsurvAoPU7uYLukX9HyV8ayhsHL0i9o9rtZ0w5GhtU86P4D8gTw9Z/J/R8W1qL//EcYWa32YADkk4OfrVXdTQAPAUCoNf/xbzC6PVQMjwlAYXLwMwcS9xPAQwCQTw5+xB9MANvtQQFY1f0S5jv6+28g+3h7VADmfD7+g9XnZeWDATCKvDP4/mq/SAAPAMDA/5rDv4if0GT2t4cFQBfm499nzy6+82es/wkwADul9XAfr+4cAAAAAElFTkSuQmCC"/> </div> </div> <div style="display:inline-block;vertical-align:middle;height:90%;width:0"></div> </body></html>';return out;
}var itself=popup, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {templates=templates||{};templates['popup']=itself;}}());

/* jshint ignore:end */
/* jshint ignore:start */

(function(){function emi(it) {
var out='<div id="emi-inner" class="mchild"> <div class="row em select"> <div class="col">Select Bank:</div> <i class="i select-arrow">&#xe601;</i> <select id="emi-bank-select"> '; for(var bank in it.banks){ out+=' <option value="'+(bank)+'"';if(bank===it.selected){out+=' selected';}out+='>'+(it.banks[bank].name)+'</option> ';}out+=' </select> </div> <strong class="row"> <div class="col">EMI Tenure</div> <div class="col">Interest Rate</div> <div class="col">Monthly Installments</div> <div class="col">Total Money</div> </strong> '; var plans = it.banks[it.selected].plans; for(var plan in it.banks[it.selected].plans){out+=' <div class="row emi-option"> <div class="col">'+(plan)+' Months</div> '; var planObj = plans[plan]; var inst = it.installment(plan, planObj, it.amount); out+=' <div class="col">'+(planObj)+'%</div> <div class="col">₹ '+(inst/100)+'</div> <div class="col">₹ '+(inst*plan/100)+'</div> </div> ';}out+=' <div id="emi-close" class="close">×</div></div>';return out;
}var itself=emi, _encodeHTML=(function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {templates=templates||{};templates['emi']=itself;}}());

/* jshint ignore:end */
function ensureNumeric(e){
  return ensureRegex(e, /[0-9]/);
}

function ensurePhone(e){
  return ensureRegex(e, e.target.value.length ? /[0-9]/ : /[+0-9]/);
}

function ensureExpiry(e){
  var shouldSlashBeAllowed = /^\d{2} ?$/.test(e.target.value);
  return ensureRegex(e, shouldSlashBeAllowed ? /[\/0-9]/ : /[0-9]/);
}

function ensureRegex(e, regex){
  if(!e) { return '' }

  var which = e.which;
  if(typeof which !== 'number'){
    which = e.keyCode;
  }

  if(e.metaKey || e.ctrlKey || e.altKey || which <= 18) { return false }
  var character = String.fromCharCode(which);
  if(regex.test(character)){
    return character;
  }
  preventDefault(e);
  return false;
}

var Card;
(function(){

  var patterns = {
    maestro16: /^(508125|508126|508159|508192|508227|504437|504681)/,
    maestro: /^(50|63|66|5[6-8]|6[8-9]|600[0-9]|6010|601[2-9]|60[2-9]|61|620|621|6220|6221[0-1])/,
    mastercard: /^(5[1-5]|2[2-7])/,
    visa: /^4/,
    // maestro: /^(5(018|0[23]|[68])|6(39|7))/,
    amex: /^3[47]/,
    diners: /^3[0689]/
    // jcb: /^35/,
    // discover: /^6([045]|22)/
    // rupay: /^(508[5-9][0-9][0-9]|60698[5-9]|60699[0-9]|60738[4-9]|60739[0-9]|607[0-8][0-9][0-9]|6079[0-7][0-9]|60798[0-4]|608[0-4][0-9][0-9]|608500|6521[5-9][0-9]|652[2-9][0-9][0-9]|6530[0-9][0-9]|6531[0-4][0-9]|6070(66|90|32|74|94|27|93|02|76)|6071(26|05|65)|607243)/
  }

  var space_14 = /(.{4})(.{0,6})/;
  var sub_14 = function( match, $1, $2 ){

    if ( $2.length === 6 ){
      $2 += ' ';
    }
    return $1 + ' ' + $2;
  }

  var card_formats = {
    amex: {
      space: space_14,
      subs: sub_14,
      length: 15
    },
    diners: {
      space: space_14,
      subs: sub_14,
      length: 14
    },
    maestro: {
      space: /[^0-9]/g,
      subs: '',
      length: 19
    }
  }
  card_formats.unknown = card_formats.maestro;

  each(patterns, function(c){
    if(!(c in card_formats)){
      card_formats[c] = {
        space: /(.{4}(?=.))/g,
        subs: '$1 ',
        length: 16
      }
    }
  })

  var CardType = function(num){
    for( var t in patterns ) {
      if( patterns[t].test(num.replace(/[^0-9]/g,'')) ) {
        return t;
      }
    }
  }

  var SetCaret = function(el, pos){
    if(navigator.userAgent.indexOf('Android')){
      return;
    }
    if(typeof el.selectionStart === 'number'){
      el.selectionStart = el.selectionEnd = pos;
    }
    else {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  var CheckSelection = function(el){
    if(typeof el.selectionStart === 'number'){
      if(el.selectionStart !== el.selectionEnd) { return true }
      return el.selectionStart;
    } else if (document.selection) {
      var range = document.selection.createRange();
      if(range.text) { return true }

      // get caret position in IE8
      var textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      return -textInputRange.moveStart('character', -el.value.length);
    }
    return el.value.length;
  }

  var expLen = 0;
  var ReFormatExpiry = function(e){
    var el = e.target;
    if(el.value.length === 2 && el.value.length >= expLen){
      el.value += ' / ';
    }
    expLen = el.value.length;
  }

  var FormatExpiry = function(e) {
    var el = e.target;
    var character = ensureExpiry(e);
    if (character === false) { return }

    var pos = CheckSelection(el);
    if (pos === true) { return }

    var value = el.value;
    var prefix = value.slice(0, pos);
    var prenums = prefix.replace(/[^\/0-9]/g,'');
    var suffix = value.slice(pos);
    var sufnums = suffix.replace(/[^\/0-9]/g,'');

    if (pos === 0) {
      if(/0|1/.test(character)) { return }
      character = '0' + character;
      pos++;
    }

    if (pos === 1) {
      if( parseInt(prefix + character, 10) > 12 ) { return preventDefault(e) }
      character += ' / ';
    }
    else if ( pos === 2 ) {
      if(character === '/'){
        character = ' ' + character + ' ';
      }
      else {
        character = ' / ' + character;
      }
    }
    else {
      if(!/^(0[1-9]|1[012])($| \/ )($|[0-9]){2}$/.test(prefix + character + suffix) && e){
        preventDefault(e);
      }
      if(pos === 6){
        var card = this;
        setTimeout(function(){card.filled(el)}, 200);
      }
      return;
    }
    preventDefault(e);

    setTimeout(function() {
      el.value = (prenums + character + sufnums).slice(0, 7);
      pos = (prefix + character).length;
      SetCaret(el, pos);
    })
  };

  var FormatExpiryBack = function(e){
    if((e.which || e.keyCode) !== 8) { return }
    var el = e.target;
    var pos = CheckSelection(el);
    if(pos === 5 && el.value.slice(2, 5) === ' / '){
      preventDefault(e);
      el.value = el.value.slice(0, 1);
    }
  }

  var FormatNumber = function(e){
    var character = ensureNumeric(e);
    if(character === false) { return }

    var el = e.target;

    var pos = CheckSelection(el);
    if(pos === true) { return }

    var value = el.value;
    var prefix = value.slice(0, pos).replace(/[^0-9]/g,'');
    var suffix = value.slice(pos).replace(/[^0-9]/g,'');
    value = prefix + character + suffix;

    var type = CardType(value) || 'unknown';
    var cardobj = card_formats[type];

    if(prefix.length + suffix.length >= cardobj.length) { return }

    var card = this;
    preventDefault(e);

    if(e) {
      setTimeout(function(){
        el.value = value.replace(cardobj.space, cardobj.subs);

        if(suffix){
          pos = prefix.length;
          var prespace = prefix.replace(cardobj.space, cardobj.subs).match(/ /g);
          pos += prespace && ++prespace.length || 1;
          SetCaret(el, pos);
        }
        if(value.length === cardobj.length){
          card.filled(el);
        }
      })
    } else {
      el.value = value.replace(cardobj.space, cardobj.subs);
    }
  };

  var FormatNumberBack = function(e){
    if((e.which || e.keyCode) !== 8) { return }

    var el = e.target;
    var pos = CheckSelection(el);
    var val = el.value;
    var len = val.length;
    
    if(pos === len && val[len-1] === ' '){
      preventDefault(e);
      el.value = el.value.slice(0, len-2);
    }
  };

  Card = function(){
    this.listeners = [];
  }

  Card.luhn = function(num){
    var odd = true;
    var sum = 0;
    var digits = (num + '').split('').reverse();

    for(var i=0; i<digits.length; i++){
      var digit = digits[i];
      digit = parseInt(digit, 10);
      if(odd = !odd){
        digit *= 2;
      }
      if(digit > 9){
        digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }

  Card.validateCardNumber = function(num, type){
    num = (num + '').replace(/\s|-/g,'');
    if(/^[0-9]+$/.test(num)){
      if (!type) {
        type = CardType(num);
      }
      if (!type && num.length > 13 || type && card_formats[type].length === num.length) {
        return Card.luhn(num);
      }
    }
    return false;
  }

  Card.prototype = {
    bind: function(el, eventListeners){
      if( !el ) { return }
      var $el = $(el);
      each(
        eventListeners,
        function(event, listener){
          this.listeners.push(
            $el.on(event, listener, null, this)
          )
        },
        this
      )
    },

    unbind: function(){
      invokeEach(this.listeners)
      this.listeners = [];
    },

    formatCardNumber: function(el){
      this.bind(el, {
        keypress: FormatNumber,
        keydown: FormatNumberBack,
        keyup: this.setType
      })
      if(el){
        this.setType({target: el});
        FormatNumber.call(this, {target: el});
      }
    },

    formatCardExpiry: function(el){
      this.bind(el, {
        input: ReFormatExpiry,
        keypress: FormatExpiry,
        keydown: FormatExpiryBack
      })
    },

    ensureNumeric: function(el){
      this.bind(el, {
        keypress: ensureNumeric
      })
    },

    ensurePhone: function(el){
      this.bind(el, {
        keypress: ensurePhone
      })
    },
    getType: CardType,
    setType: noop,
    filled: noop
  };

})();
(function(){

  var inputClass = 'input';
  var focusEvent = 'focus';
  var blurEvent = 'blur';
  var shim_placeholder = document.createElement('input').placeholder === undefined;

  var detectSupport = function(){
    var div = document.createElement('div');
    if(typeof div.onfocusin !== 'undefined'){
      focusEvent += 'in';
      blurEvent = 'focusout';
    }
  }

  var Smarty = window.Smarty = function(parent, options){
    this.parent = $(parent);
    this.options = options;
    this.listeners = [];
    detectSupport();
    this.common_events();
    this.init();
  }

  Smarty.prototype = {
    on: function(eventName, targetClass, eventHandler, useCapture){
      this.listeners.push(
        this.parent.on(
          eventName,
          function(e){
            if(!targetClass || e.target.className.match(targetClass)){
              eventHandler.call(this, e);
            }
          },
          useCapture,
          this
        )
      )
    },

    off: function(){
      invokeEach(this.listeners);
      this.listeners = [];
    },

    common_events: function(){
      this.on(focusEvent, inputClass, this.focus, true);
      this.on(blurEvent, inputClass, this.blur, true);
      this.on('input', inputClass, this.input, true);
    },

    focus: function(e){
      $(e.target.parentNode).addClass('focused');
    },

    blur: function(e){
      var $div = $(e.target.parentNode);
      $div.removeClass('focused');
      $div.addClass('mature');
      this.input(e);
    },

    intercept: function(e){
      var parent = e.target;
      var className = parent.className;
      if(/input/.test(className)){
        return;
      }
      if(!/elem/.test(parent.className)){
        parent = parent.parentNode;
      }
      var child = $(parent).find('.input')[0];
      if(child){
        invoke('focus', child, null, 0);
      }
    },

    input: function(e){
      var el = e.target;
      var parent = $(el.parentNode);
      var value = el.value;
      parent[value && 'addClass' || 'removeClass']('filled');
      if ( typeof el.getAttribute('ignore-input') === 'string' ) { return }

      var valid = true;
      var required = el.required || typeof el.getAttribute('required') === 'string';
      var pattern = el.getAttribute('pattern');

      if (required && !value) {
        valid = false;
      }
      if (valid && pattern) {
        valid = !value && !required || new RegExp(pattern).test(value);
      }
      parent[valid && 'removeClass' || 'addClass']('invalid');
    },

    init: function(){
      this.refresh(function(child){
        var attr = child.getAttribute('placeholder');
        if(attr && shim_placeholder){
          var placeholder = document.createElement('span');
          placeholder.className = 'placeholder';
          placeholder.innerHTML = attr;
          child.parentNode.insertBefore(placeholder, child);
        }
      })
    },

    refresh: function(callback){
      var self = this;
      each(
        $(this.parent[0]).find('.input'),
        function(i, el){
          self.update(el);
          if(callback){
            callback(el);
          }
        }
      )
    },

    update: function(el){
      if(el){
        this.input({target: el});
        try{
          if(document.activeElement === el) {
            el.parentNode.addClass('focused')
          }
        }
        catch(e){}
      }
    }
  }
})();
(function() {

  var timeout, transitionProperty;

  var defaults = {
    escape: true,
    animation: true,
    backdropclose: true,
    onhide: null,
    onhidden: null
  };

  var clearTimeout = function(){
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = null;
  }

  if(Array.prototype.some){
    ['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some(function(i) {
      if (typeof document.documentElement.style[i] === 'string') {
        transitionProperty = i + 'Duration';
        return true;
      }
    });
  }

  var getDuration = function(modal){
    return (modal.options.animation && transitionProperty) ? 300 : 0;
  }

  var Modal = window.Modal = function(element, options) {
    each(defaults, function(key, val){
      if(!(key in options)){
        options[key] = val;
      }
    })
    this.options = options;
    this.container = $(element);
    this.animationDuration = getDuration(this);

    this.listeners = [];
    this.show();
    this.bind();
  };

  Modal.prototype = {
    show: function() {
      if(this.isShown) { return }
      this.isShown = true;
      this.container.reflow().addClass('shown');
      clearTimeout();
      timeout = setTimeout(this.shown, this.animationDuration);
      this.container.focus();
    },

    shown: function() {
      clearTimeout();
    },

    hide: function() {
      if(!this.isShown) { return }
      this.isShown = false;

      this.container.removeClass('shown');
      
      clearTimeout();
      var self = this;

      timeout = setTimeout(function(){
        self.hidden();
      }, this.animationDuration);

      if(typeof this.options.onhide === 'function') {
        this.options.onhide();
      }
    },

    backdropHide: function(){
      if(this.options.backdropclose) {
        this.hide();
      }
    },

    hidden: function() {
      clearTimeout();
      if(typeof this.options.onhidden === 'function') {
        this.options.onhidden();
      }
    },

    on: function(event, target, callback){
      this.listeners.push(
        $(target).on(event, callback, false, this)
      );
    },

    steal_focus: function(e) {
      if (!e.relatedTarget) {
        return;
      }
      if (!$(this).find(e.relatedTarget).length) {
        return this.focus();
      }
    },

    bind: function(){
      if(typeof window.pageYOffset === 'number') { // doesn't exist <ie9. we're concerned about mobile here.
        this.on('resize', window, function(){
          var el = document.activeElement;
          if(el){
            var rect = el.getBoundingClientRect();
            if(rect.bottom > innerHeight - 70){
              setTimeout(function(){
                scrollTo(0, pageYOffset - innerHeight + rect.bottom + 60)
              }, 500)
            }
          }
        })
      }
      if (this.options.escape) {
        this.on('keyup', window, function(e) {
          if ((e.which || e.keyCode) === 27) {
            if(!hideEmi() && !overlayVisible()){
              this.hide();
            }
          }
        })
      }
      if (this.options.backdropclose) {
        this.on('click', gel('backdrop'), this.backdropHide)
      }
    },

    destroy: function(){
      invokeEach(this.listeners);
      this.listeners = [];
    }
  };
})();

function User (o) {
  this.phone = o.phone || '';
  this.email = o.email || '';
  this.logged_in = o.logged_in || null;
  this.saved = o.saved || null;
  this.wants_skip = o.wants_skip || null;
}

User.prototype = {
  lookup: function(callback){
    var user = this;
    $.ajax({
      url: discreet.makeUrl() + this.phone,
      data: {
        key: this.key
      },
      callback: function(data){
        user.saved = true//!!data.saved;
        callback();
      }
    })
  },

  login: function(){
    $.ajax({
      url: discreet.makeUrl() + 'otp/create',
      data: {
        contact: this.phone,
        key: this.key
      }
    })
  },

  verify: function(otp, callback){
    var user = this;
    $.ajax({
      url: discreet.makeUrl() + 'otp/verify',
      data: {
        contact: this.phone,
        key: this.key,
        otp: otp
      },
      callback: function(data){
        user.logged_in = user.saved = true//!!data.success;
        callback();
      }
    })
  },

  setPhone: function(phone){
    if (this.phone !== phone) {
      this.logged_in = this.saved = this.wants_skip = null;
      this.phone = phone;
    }
  }
}

function selectEmiBank(e){
  var $target = $(e.target);
  if($target.hasClass('option')){
    var duration = $target.attr('value');
    var parent = $('#emi-check-label').toggleClass('checked', duration);
    $(parent.find('.active')[0]).removeClass('active');
    $target.addClass('active');
    invoke('blur', parent, null, 100);
  }
}

function emiView(session){
  var opts = session.emi_options;
  opts.amount = session.get('amount');
  this.opts = opts;
  this.listeners = [];
  this.render();
}

emiView.prototype = {
  render: function() {
    this.unbind();
    $('#emi-wrap').html(templates.emi(this.opts));
    this.bind();
  },

  onchange: function(e){
    this.opts.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener){
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function(){
    this.on('mousedown', '#emi-select', selectEmiBank);
    this.on('click', '#view-emi-plans', function(){showOverlay($('#emi-wrap'))});
    this.on('click', '#emi-close', hideEmi);
    this.on('change', '#emi-bank-select', bind(this.onchange, this));
  },

  unbind: function(){
    invokeEach(this.listeners);
    this.listeners = [];
  }
}
// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

var fontTimeout;

function validateCardNumber(el){
  if(el){
    if(!(el instanceof Element)){
      el = el.target;
    }
    $(el.parentNode)[Card.validateCardNumber(el.value, el.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
  }
}

// switches cvv help text between 3-4 characters for amex and non-amex cards
function formatCvvHelp(el_cvv, cvvlen){
  el_cvv.maxLength = cvvlen;
  el_cvv.pattern = '[0-9]{'+cvvlen+'}';
  $(el_cvv.parentNode)[el_cvv.value.length === cvvlen ? 'removeClass' : 'addClass']('invalid');
}

function fillData($container, returnObj) {
  each(
    $container.find('input[name],select[name]'),
    function(i, el){
      if(/radio|checkbox/.test(el.getAttribute('type')) && !el.checked) {
        return;
      }
      if(!el.disabled) {
        returnObj[el.name] = el.value;
      }
    }
  )
}

function makeEmiDropdown(emiObj, session){
  var h = '';
  each(
    emiObj.plans,
    function(length, rate){
      h += '<div class="option" value="'+length+'">'
        + length + ' month EMI @ ' + rate + '% (&#xe600; '
        + emi_options.installment(length, rate, session.get('amount'))/100
        + ' per month)</div>';
    }
  )
  $('#emi-plans-wrap').html(h);
}

function setEmiBank(data){
  var activeEmiPlan = $('#emi-plans-wrap .active')[0];
  if(activeEmiPlan){
    data.method = 'emi';
    data.emi_duration = activeEmiPlan.getAttribute('value');
  }
}

function onSixDigits(e){
  var el = e.target;
  var val = el.value;
  var isMaestro = gel('elem-card').getAttribute('cardtype') === 'maestro';
  var sixDigits = val.length > 5;
  $(el.parentNode).toggleClass('six', sixDigits);
  var emiObj;

  var nocvvCheck = gel('nocvv-check');

  if(sixDigits){
    if(isMaestro){
      if(nocvvCheck.disabled){
        nocvvCheck.disabled = false;
      }
    }
    else {
      each(
        emi_options.banks,
        function(bank, emiObjInner){
          if(emiObjInner.patt.test(val.replace(/ /g,''))){
            emiObj = emiObjInner;
          }
        }
      )
    }
  }
  else {
    nocvvCheck.disabled = true;
  }

  var emi_parent = $('#emi-check-label')[emiObj ? 'removeClass' : 'addClass']('disabled');
  if(emiObj){
    $('#expiry-cvv').removeClass('hidden');
    makeEmiDropdown(emiObj, this);
  }
  else {
    emi_parent.removeClass('checked');
    $(emi_parent.find('.active')[0]).removeClass('active');
  }
  noCvvToggle({target: nocvvCheck});

  var elem_emi = $('#elem-emi');
  var hiddenClass = 'hidden';

  if(isMaestro && sixDigits){
    elem_emi.addClass(hiddenClass);
  }
  else if(elem_emi.hasClass(hiddenClass)) {
    invoke('removeClass', elem_emi, hiddenClass, 200);
  }
}

function noCvvToggle(e){
  var nocvvCheck = e.target;
  var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
  $('#expiry-cvv').toggleClass('hidden', shouldHideExpiryCVV);
}

function makeVisible(){
  this
    .css('display', 'block')
    .reflow()
    .addClass('shown');
}

function makeHidden(){
  if(this[0]){
    this.removeClass('shown');
    invoke('hide', this, null, 200);
  }
}

function showOverlay($with){
  makeVisible.call($('#overlay'));
  if($with){
    makeVisible.call($with);
  }
}

function hideOverlay($with){
  makeHidden.call($('#overlay'));
  if($with){
    makeHidden.call($with);
  }
}

function hideEmi(){
  var emic = $('#emi-wrap');
  var wasShown = emic.hasClass('shown');
  if(wasShown){
    hideOverlay(emic);
  }
  return wasShown;
}

function hideOverlayMessage(){
  var errEl = $('#error-message');
  if(!errEl.hasClass('shown')){
    errEl = $('#powerwallet');
  }
  hideOverlay(errEl);
}

function overlayVisible(){
  return $('#overlay').hasClass('shown');
}

function showErrorMessage(message){
  $('#fd-t').html(message);
  showOverlay(
    $('#error-message').removeClass('loading')
  );
}

function showLoadingMessage(){
  $('#fd-t').html('Loading, please wait...');
  showOverlay(
    $('#error-message').addClass('loading')
  );
}

function setDefaultError(){
  var msg = discreet.defaultError();
  msg.id = _uid;
  setCookie('onComplete', stringify(msg));
}

// this === Session
function errorHandler(response){
  if(!response || !response.error){
    return;
  }
  var message;
  this.shake();
  this.clearRequest();
  if(this.modal){
    this.modal.options.backdropclose = this.get('modal.backdropclose');
  }

  message = response.error.description;
  var err_field = response.error.field;
  if (err_field){
    if(!err_field.indexOf('expiry')){
      err_field = 'card[expiry]';
    }
    var error_el = document.getElementsByName(err_field)[0];
    if (error_el && error_el.type !== 'hidden'){
      var help = $(error_el)
        .focus()
        .parent()
        .addClass('invalid')
        .find('help-text')[0];

      if(help){
        $(help).html(message);
      }
      return hideOverlayMessage();
    }
  }

  showErrorMessage(message || 'There was an error in handling your request');
  $('#fd-hide').focus();
}

// this === Session
function otpErrorHandler(response){
  this.clearRequest();
  this.requestTimeout = invoke(
    'showOTPScreen',
    this,
    {
      error: true,
      text: response.error.description
    },
    200
  )
}

function getTab(tab){
  return $('#tab-' + tab);
}

function getPhone(){
  return gel('contact').value;
}

// this === Session
function successHandler(response){
  this.clearRequest();
  // prevent dismiss event
  this.modal.options.onhide = noop;

  // sending oncomplete event because CheckoutBridge.oncomplete
  Razorpay.sendMessage({ event: 'complete', data: response });
  this.hide();
}

// this === Session
function secondfactorHandler(done, tab){
  this.secondfactorCallback = done;
  this.showOTPScreen({
    text: 'Sending OTP to',
    loading: true,
    number: true
  })
  $('#otp').val('');
  this.requestTimeout = invoke(
    'showOTPScreen',
    this,
    {
      text: 'An OTP has been sent to',
      number: true,
      otp: true
    },
    750
  )
}

function Session (options) {
  this.get = Options(options).get;
  this.listeners = [];
  this.tab = '';
}

Session.prototype = {
  // so that accessing this.data would not produce error
  data: emo,
  params: emo,
  getClasses: function(){
    var classes = [];
    if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
      classes.push('mobile');
    }

    if(!this.get('image')){
      classes.push('noimage');
    }

    if(shouldFixFixed){
      classes.push('ip')
    }
    return classes.join(' ');
  },

  getEl: function(){
    if(!this.el){
      var div = document.createElement('div');
      div.innerHTML = templates.modal(this);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
      $(this.el).addClass(this.getClasses());
    }
    return this.el;
  },

  fillData: function(){
    var tab = this.data.method || this.get('prefill.method');
    if(tab){
      this.switchTab(tab);
    }

    if(this.hasOwnProperty('data')){
      var data = this.data;

      var exp_m = data['card[expiry_month]'];
      var exp_y = data['card[expiry_year]']
      if(exp_m && exp_y) {
        data['card[expiry]'] = exp_m + ' / ' + exp_y;
      }

      each(
        {
          'contact': 'contact',
          'email': 'email',
          'bank': 'bank-select',
          'card[name]': 'card_name',
          'card[number]': 'card_number',
          'card[expiry]': 'card_expiry',
          'card[cvv]': 'card_cvv'
        },
        function(name, id){
          var el = gel(id);
          var val = data[name];
          if(el && val) {
            el.value = val;
          }
        }
      )
    }
  },

  render: function(){
    if(this.isOpen){
      this.saveAndClose();
    }
    else {
      this.isOpen = true;
    }

    this.getEl();
    this.fillData();
    this.setUser();
    this.setEMI();
    this.setModal();
    this.setSmarty();
    this.setCard();
    this.bindEvents();
    errorHandler.call(this, this.params);

    var key = this.get('key');
  },

  setEMI: function(){
    if(!this.emi && this.methods.emi && this.get('amount') > emi_options.min){
      $(this.el).addClass('emi');
      this.emi = new emiView(this);
    }
  },

  setModal: function(){
    if(!this.modal){
      this.modal = new window.Modal(this.el, {
        backdropclose: this.get('modal.backdropclose'),
        onhide: function(){
          Razorpay.sendMessage({event: 'dismiss'});
        },
        onhidden: bind(
          function(){
            this.saveAndClose();
            Razorpay.sendMessage({event: 'hidden'});
          },
          this
        )
      })
    }
  },

  setSmarty: function(){
    this.smarty = new window.Smarty(this.el);
  },

  renderCss: function(){
    var div = this.el;
    var style = document.createElement('style');
    style.type = 'text/css';
    try{
      div.style.color = this.get('theme.color');
      if(div.style.color){
        var rules = templates.theme(this.get);
        if (style.styleSheet) {
          style.styleSheet.cssText = rules;
        } else {
          style.appendChild(document.createTextNode(rules));
        }
      }
      div.style.color = '';
    } catch(e){
      roll(e.message);
    }
    return style;
  },

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      $(this.el).addClass('font-loaded');
    }
    else if(retryCount < 25) {
      var self = this;
      fontTimeout = setTimeout(function(){
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  hideErrorMessage: function(){
    if(this.request){
      if(confirm('Cancel Payment?')){
        this.clearRequest();
      } else {
        return;
      }
    }
    hideOverlayMessage();
  },

  shake: function(){
    if ( this.el ) {
      $(this.el.querySelector('#modal-inner'))
        .removeClass('shake')
        .reflow()
        .addClass('shake');
    }
  },

  on: function(event, selector, listener, useCapture){
    var elements = $$(selector);
    each(
      elements,
      function(i, element){
        this.listeners.push(
          $(element).on(event, listener, useCapture, this)
        );
      },
      this
    )
  },

  bindEvents: function(){
    if(this.get('theme.close_button')){
      this.on('click', '#close', this.hide);
    }
    this.on('click', '#tab-title, #topbar .back', this.switchTab);
    this.on('click', '.payment-option', this.switchTab);
    this.on('submit', '#form', this.submit);

    this.on('submit', '#otp-form', this.onOtpSubmit);

    var enabledMethods = this.methods;

    if(enabledMethods.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
      if(!window.addEventListener){
        this.on('click', '#netb-banks .bank-radio', this.selectBankRadio);
      }
    }

    if(enabledMethods.card){
      this.on('blur', '#card_number', validateCardNumber);
      this.on('keyup', '#card_number', onSixDigits);
      // this.on('change', '#nocvv-check', noCvvToggle);
    }

    // if(enabledMethods.wallet.mobikwik){
    //   this.on('submit', '#powerwallet', this.onOtpSubmit);
    //   this.on('click', '#powercancel', this.hideErrorMessage);
    // }

    this.on('click', '#backdrop', this.hideErrorMessage);
    this.on('click', '#overlay', this.hideErrorMessage);
    this.on('click', '#fd-hide', this.hideErrorMessage);
  },

  setCard: function(){
    if(!this.card){
      this.card = new Card();
    }
    var card = this.card;
    var el_number = gel('card_number');
    var el_expiry = gel('card_expiry');
    var el_cvv = gel('card_cvv');
    var el_contact = gel('contact');
    var el_name = gel('card_name');

    card.setType = function(e){
      var el = e.target;
      var type = card.getType(el.value) || 'unknown';
      var parent = el.parentNode;

      var oldType = parent.getAttribute('cardtype');
      if(type === oldType){
        return;
      }

      parent.setAttribute('cardtype', type);
      validateCardNumber(el);
      
      if(type === 'amex' || oldType === 'amex'){
        formatCvvHelp(el_cvv, type === 'amex' ? 4 : 3)
      }
    }

    if(shouldFocusNextField){
      card.filled = function(el){
        var next;
        if (el === el_expiry) {
          if(!$(el.parentNode).hasClass('invalid')){
            next = $('.elem-name.filled input')[0];
            if (next) {
              next = el_cvv;
            } else {
              next = el_name;
            }
          }
        } else if (el === el_number) {
          next = el_expiry;
        }
        if(next){
          next.focus();
        }
      }
    }

    card.formatCardNumber(el_number);
    card.formatCardExpiry(el_expiry);
    card.ensureNumeric(el_cvv);
    card.ensurePhone(el_contact);

    var otpEl = gel('powerotp')
    if(otpEl){
      card.ensureNumeric(otpEl);
    }

    // check if we're in webkit
    // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
    if ( el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string' ) {
      el_cvv.type = 'tel';
    }
  },

  setTopbar: function(tab){
    var $body = $('#body');
    if (tab) {
      $body.addClass('tab');
      $('#tab-title').html(tab_titles[tab]);
    } else {
      $body.removeClass('tab');
      $('.tab-content.shown').removeClass('shown');
    }
  },

  switchTab: function(tab){
    if(typeof tab !== 'string'){
      tab = tab.currentTarget.getAttribute('tab') || '';
    }
    if (!this.tab && this.checkInvalid($('#form-common'))) {
      return;
    }
    if (this.sub_tab) {
      gel('otp-form').className = '';
      $('#form').addClass('shown');
      this.sub_tab = null;
      tab = 'wallet';
    }

    $('#form-common').addClass('not-first');

    // $('#body').toggleClass('tab', tab);

    // if(tab){
    //   $('#tab-title').html(tab_titles[tab]);
    //   $('#user').html(gel("contact").value);
    //   getTab(tab).addClass('shown');
    // } else {
    //   $('.tab-content.shown').removeClass('shown');
    this.setTopbar(tab);
    this.tab = tab;
    if (tab) {
      // if (tab === 'card') {
      //   var user = this.user;
      //   user.setPhone(getPhone());
      //   if( typeof user.saved !== 'boolean') {
      //     return this.lookupUser();
      //   } else if (user.saved && !user.logged_in && !user.wants_skip) {
      //     return this.loginUser();
      //   } else {
      //     // preferences.tokens
      //   }
      // }
      getTab(tab).addClass('shown');
    }
  },

  loginUser: function(){
    this.user.login();
    invoke(secondfactorHandler, this, function(data){
      this.user.verify(
        data,
        bind(
          function(){
            this.switchTab('card');
          },
          this
        )
      )
    });
  },

  lookupUser: function(){
    this.showOTPScreen({
      text: '<strong>Looking for saved cards with Razorpay</strong>',
      loading: true
    })
    this.user.lookup(
      bind(
        function(){
          this.switchTab('card');
        },
        this
      )
    )
  },

  setUser: function(){
    var userOptions = preferences.user ? preferences.user : emo;
    this.user = new User(userOptions);
    this.user.key = this.get('key');
  },

  switchBank: function(e){
    var val = e.target.value;
    each(
      $$('#netb-banks input'),
      function(i, radio) {
        if(radio.value === val){
          radio.checked = true;
        } else if(radio.checked){
          radio.checked = false;
        }
      }
    )
  },

  selectBankRadio: function(e){
    var select = gel('bank-select');
    select.value = e.target.value;
    this.smarty.input({target: select});
  },

  checkInvalid: function($parent) {
    var invalids = $parent.find('.invalid');
    if(invalids[0]){
      this.shake();
      var invalidInput = $(invalids[0]).find('.input')[0];
      if(invalidInput){
        invalidInput.focus();
      }

      each( invalids, function(i, field){
        $(field).addClass('mature');
      })
      return true;
    }
  },

  getFormData: function(){
    var tab = this.tab || '';
    var data = {};
    var activeTab;

    fillData($('#form-common'), data);

    if(tab){
      activeTab = getTab(tab);
      data.method = tab;
      fillData(activeTab, data);
    }

    if(tab === 'card'){
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');

      if(!data['card[expiry]']){
        data['card[expiry]'] = '';
      }

      if(!data['card[cvv]']){
        data['card[cvv]'] = '';
      }

      var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
    }
    return data;
  },

  hide: function(){
    if(this.isOpen){
      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
    }
  },

  showOTPScreen: function(state){
    if (!this.sub_tab || !this.isOpen) {
      return;
    }
    $('#otp-form').addClass('shown');
    $('#form').removeClass('shown');
    $('#otp-form').toggleClass('loading', state.loading);
    $('#otp').toggleClass('shown', state.otp);

    var wallet = state.wallet;
    if(wallet){
      var walletObj = freqWallets[wallet];
      gel('tab-title').innerHTML = '<img src="'+walletObj.col+'" height="'+walletObj.h+'">';
    }

    if(state.number){
      state.text += ' ' + getPhone();
    }

    gel('otp-prompt').innerHTML = state.text;
  },

  onOtpSubmit: function(e){
    preventDefault(e);
    this.showOTPScreen({
      loading: true,
      text: 'Verifying OTP...'
    })
    this.secondfactorCallback(gel('otp').value);
  },

  clearRequest: function(){
    var powerotp = gel('powerotp');
    if(powerotp){
      powerotp.value = '';
    }
    if(this.request){
      if(this.request.ajax){
        this.request.ajax.abort();
      }
      this.request = null;
    }
    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  bind: function(func){
    return bind(func, this);
  },

  submit: function(e) {
    preventDefault(e);
    this.smarty.refresh();

    var nocvv_el = gel('nocvv-check');
    var nocvv_dummy_values;

    if(!this.tab){
      return;
    }

    // if card tab exists
    if(nocvv_el){
      validateCardNumber(gel('card_number'));
      if(nocvv_el.checked && !nocvv_el.disabled){
        nocvv_dummy_values = true;
        $('.elem-expiry').removeClass('invalid');
        $('.elem-cvv').removeClass('invalid');
      }
    }

    if(this.checkInvalid($('#form-common'))){
      return;
    }

    var activeTab = $('.tab-content.shown');
    if (activeTab[0] && this.checkInvalid(activeTab)){
      return;
    }

    var data = this.getPayload(nocvv_dummy_values);

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    var wallet = data.wallet;
    if (data.method === 'wallet') {
      var walletObj = freqWallets[wallet];

      if (!walletObj || walletObj.custom) {
        return;
      }
    }

    if(this.modal){
      this.modal.options.backdropclose = false;
    }

    var request = {
      data: data,
      fees: preferences.fee_bearer,
      options: {
        image: this.get('image'),
        redirect: this.get('redirect')
      },
      success: this.bind(successHandler)
    };

    if((wallet === 'mobikwik' || wallet === 'payumoney') && !request.fees){
      request.error = this.bind(otpErrorHandler);
      request.secondfactor = this.bind(secondfactorHandler);

      this.sub_tab = wallet;
      this.showOTPScreen({
        loading: true,
        number: true,
        text: 'Checking for a ' + wallet + ' account associated with',
        wallet: wallet
      })
    } else {
      request.error = this.bind(errorHandler);
      showLoadingMessage('Please wait while your payment is processed...');
    }
    this.request = Razorpay.payment.authorize(request);
  },

  getPayload: function(nocvv_dummy_values){
    var data = this.getFormData();
    setEmiBank(data);

    if(nocvv_dummy_values){
      data['card[cvv]'] = '000';
      data['card[expiry_month]'] = '12';
      data['card[expiry_year]'] = '21';
    }
    // data.amount needed by external libraries relying on `onsubmit` postMessage
    each(
      ['amount', 'currency', 'signature', 'description', 'order_id'],
      function(i, field){
        var val = this.get(field);
        if(val){
          data[field] = this.get(field);
        }
      },
      this
    )

    // data.key_id needed by discreet.shouldAjax
    data.key_id = this.get('key');

    each(
      this.get('notes'),
      function(noteKey, noteVal){
        data['notes[' + noteKey + ']'] = noteVal;
      }
    )
    return data;
  },

  close: function(){
    if(this.isOpen){
      if(this.request){
        this.request.cancel();
        this.request = null;
      }
      this.isOpen = false;
      clearTimeout(fontTimeout);
      invokeEach(this.listeners);
      this.listeners = [];
      this.modal.destroy();
      this.smarty.off();
      this.card.unbind();
      $(this.el).remove();

      if(this.emi){
        this.emi.unbind();
      }

      this.modal =
      this.smarty =
      this.card =
      this.emi =
      this.el =
      window.setPaymentID =
      window.onComplete = null;
    }
  },

  saveAndClose: function(){
    this.data = this.getFormData();
    this.close();
  }
}

// flag for checkout-frame.js
discreet.isFrame = true;

var preferences = window.preferences,
  CheckoutBridge = window.CheckoutBridge,
  sessions = {},
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener;

function getSession(id){
  return sessions[id || _uid];
}

function addBodyClass(className){
  $(doc).addClass(className);
}

// initial error (helps in case of redirection flow)
var qpmap = {};

var gifBase64Prefix = 'data:image/gif;base64,';
var sessProto = Session.prototype;
sessProto.netbanks = {
  SBIN: {
    image: 'R0lGODlhKAAoAMQQAPD2/EGI2sTa86fI7m2k4l6b3+Lt+dPk9nyt5SR21Hut5cXb9Jm/61CS3f///xVt0f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXyICSO5GgMRPCsbEAMRinPslCweL4WAu2PgoZumGv0fiUAgsjMIQBIEUDVrK4C0N8hYe0+EgcfgOvtJrJJarmLlS3XZURJAIcfRcJ6uQHU20U3fmUFEAaCcCeHayiKZSlwCgsLCnBqXgcOmQ4HjUwKmpqUnToLoJkLo6SmDqipOJ+moq4smJqca5ZdDJkMlQRwDZl5jgPAwnAwxg7DXjGBXsHLa4QQdHvHZXfMVdHbTXx90NhddyJvVt1ecmld6VZtMmPo40xnPlvc9ENgSFPf+jng9Tunw92QJ1FIBBliEIeRhDNsFNHHA+KPE4/SuYCRMAQAOw==',
    title: 'SBI'
  },
  HDFC: {
    image: 'R0lGODlhKAAoAKIAAL/S4+4xN/WDh+/0+PJaXwBMj////+0jKiH5BAAAAAAALAAAAAAoACgAAAOqeLrca9C4SauL0uqtMP+VB46MSJLmCaZqh71wHBGcbNv0du9vrvFAg88S5A1DxduRklTWYIWodBoFwJaTGHVbsPaeLy7Vi8FeoGIpeXbmpdXN27sat827ddl9jSP4/1pzfAYCf39ZaG+DZg2BildgGHuQOjAAl5iZlwOUP3lflZ9soaJCkaKMJaUQqQ+rphuGsn5ls4YBLaoQuSsRvB8sv0y+wp67xUTEIwkAOw==',
    title: 'HDFC'
  },
  ICIC: {
    image: 'R0lGODlhKAAoAOZGAP/58evKy/ry8vzOk/qpQsRfZMJHLvqvUP7t1uGvsbUxL79SV9iVmPmjNbpFSueAKbU3PctVLfCPKPvCeP7z5PDX2PzIhvSWKNVkLOa8vsltcfu2Xc56frk4L850cNeUl/Xk5f3myd5yKtOHi+uHKfzUoMdOLf3arr5MSf/58r5ALv3gu9+EU9yipLo/PPXe1/rs5eCjlvTYytybl+qxle/FsMRZVvu8a+J5Kuq9sNlrK/7nyeOAN+Wee/3gvNyWifWcNeGopOuONvmdJ////7AqMP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAoACgAAAf/gEaCg4SFhoICCR4oRY1FLh45h5OUgwEejpmZNi+VnoIBBZqjjhAVn5MwmJkQDAJEAgujKACohTUumgsVRL1EGaQztoIAPQqaECC+vcCjDsMALKQJy70cpEWnnwg8pBDVRCDYRUHbQsejBdWx4x+eCEDoowvLILLtlQANBuNFDAEBGEDoV8TdJAAHMBBcmMngoQkS+hVoESCDBoYxJpUYwo+UgwDVLhKUcYhCgwfYRryqxoCggVqGNnB0BhIckWv9WBw6MQSlpgIrwQkg2MGCIX1DTGjiYNNXAoIiEBgaMOSCJmpNe4nE1oHA0QZDRGQakbXX0H4PThjaOCRCpgAC+xg4KEKvWot+JhrAJERgyJAO/XgtE8X1wgBDCPwOIVjTbD8SXg1Z8EuCYLWn2EQMWXGob0/Ly7ZqwjBkQ0nFPrGpWzZwVIQhDSgcCqE44jimvgKQer15ElXF8kZh7dVSkw6/Eyj99qsUmzJfhBspwOH3QKXlnz1Wy6SCRPW9h7DPHEXWVwXppP0SAB9esd8LKkZlWKY7ggTFBKR6Yuv+gltHDlRDw32KHcDeJIm5VxsGBhjwQzXYbXAgJZ4p6B4F1figmFHDGMGThYrdYNMEE4TQ4SAHgOjXDlmdOAgFFbpnQVMuFgKATO4dkAI4NU4SwgQHEDDAjsv0OEggADs=',
    title: 'ICICI'
  },
  UTIB: {
    image: 'R0lGODlhKAAoAMQQAOvJ1vry9bM1Z7hDcfXk68JehtaTrvDX4eGuwsdrkNKGpMx5mr1Qe+a8zNuhuK4oXf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAoACgAAAXdICSOZGmeaKqubIsGgSunyjLf5PE8B44Xu4Jv1tjtEMNWYGB8DGJJlaG5M0RTBAF1R7ieEttdwlsChI0A8ohx3g3UEEfb2PMGtPMxWTHnknV9VmRAcwJQVwh9D0h2THNvZFN9aV4EikJkYH1dXmZ9CmqObQJ4bZArknMOqW0OK3d9kKJnhioLipRFnymeeSSEc3UmwG2cIpZ9mCWJgSZ8fYwjsI+H0qVnTySsZ9HLioIQyHPKJ2yFnMRnwie9bWO6czYrt5OzYbUrWX0MAP3+//3WqTgAsCAlOAivhAAAOw==',
    title: 'Axis'
  },
  KKBK: {
    image: 'R0lGODlhKAAoANUtAL/N3O/z9s/a5d/m7kBqlyBRhTBdjjsxYFB2oI+owoCcup+0y3cqTK/B1HCPsVB2n2CDqPvGyB41avRxdkovW+4qMmgsUfBHTf7x8fm4u4tviw82b+idpNy8xf3j5PNjaI2Mp7dqfPaOkntjg5QnQsEhM4hFYks9ad4eKRBEfe0cJP///wA4dP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAC0ALAAAAAAoACgAAAb/wJZwSCwaj8ikcslsFgOAqDTgdA4SiBRry92mEIlB9bggdM9oFmExFgIK6fi5AHAGEPKuZCNHUJUCBnksEhYlKgd5BgJJAlp5FiqSiIMpjEaOgywMk5SVl0MBgmgFcFyck4maBn9CDmcEDSuzKwtwqJIHKQoDtAMKj1wOQwBnELTIKwq4KhoBybMDo1x1LXhcBNDIHJMT2rQBplsILQNnvd8rEZIX6bTFXVddD8lQyOsVGO60ZlwJ/VsWRIMQrAAEAOsiaGvg4EGCZysadCEQjEWvTGlMiIAWqIulFQE8npklDs0IjhW9EACYZoW5OCkg+kqpiYtLOQCgTat55tlOui4Ck72CqUBByYqyBByVlSwDCJoBZwVLwdLBrAALHjiUSctDBZBG5wmINjGBR67fMFxQgWxAlGRm/b3komDfig+SOuwrKYYli7HpJkw6AVibgi7kWsDjkiIntAAhOukqjGzBmWothnaBwHSFAGDMVPGi1cDvsFA/44SuyaoIxjyrPx15rVqybCQd5XBCQYLCoEVL7sg54FuTHydveJLCXKWMcjVs2hC5kgUmGDHSk0CREqVV9u/gwy8JAgA7',
    title: 'Kotak'
  },
  YESB: {
    image: 'R0lGODlhKAAoANUxAMg0KRBcmfTW1NNcVNdqY8tBOOmtqfvx8c9PRjBypyBnoPjk4sJ9gKGTpL9EP8ptajxvn9WVlFl3nuGSjfDJxrSruY16j2yQtK5la6qCj8dfXFyFrdp4cbCdq2mCpZSWq52FlixkmaZ1gHiNrL5wcqu7zrWAh3ybu1VqkXR/npGIncNRTc56eEB9rb/T5MQmGwBRkv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADEALAAAAAAoACgAAAb/wJhwSCwaj0bDAslsNgUTp3QaOyAO1CySYNB6iQbEdywAUMZeKwHt5byWR5d8Tq/b74YX6y6H+f+AgYKCKAAAEIOJioswIQ4vIoySkgEYLwUJk5qJFi8vFpuhgBIALysKoqIJjy8pqaGVng8Br5sgngAStZoepS8Mu5MJA54FiMGLAQyeLxnIjA3MCKjPiRe+LyrVicPMGrTbgcrMLyPhgtHMJODnftfMABvtfy0E5CbzfgER5AUt+TAqkHvRAeCJAuQGUGtXb+CHfPsGztrVoqLFiwLJAShxsaPHj0UOEBhAEpunKGyOlBlYDEtKlSY9dXmJZCWzATSfYDuTk8nKBzU9n7zpGQQAOw==',
    title: 'Yes'
  }
};

var freqWallets = sessProto.walletData = {
  paytm: {
    h: '16',
    col: gifBase64Prefix + 'R0lGODlhUAAYANUgAD/L9UJik+/y9oGWtzJVihM6dw++8+/7/mJ8pV/U9+Dl7dDY5M/y/S/H9JGjwCNHgZ/l+r/u/B/C9K/p+9/2/bC90lJvnKGwyW/Y+HGJrsLu/I/h+cDL23/c+AC68gQub////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACAALAAAAABQABgAAAb/QJBwSCwaj8gkEiJhKJ/QqHQKgng8Hap2yy1ar9nuUMEpm8uLI/nMSRMFg7hb6JAXGZPE9ZqIHEAUERFOIBEdHRFDBxAdEH9CBR+Sk5MPHEWRlJIPFUMWkwUKQgigokITe6lXDRoGewkSqRITGK57YZq5BXMguZSdIAGUl73DQx2qqnrJzKpZvpoIRNCSBELCk8SaxCDIzR7L398U1JVEBOUCIA/GxdnH4uHizBvlk29xcZnv20L9QgcaNEvgbZ4Bgak6aKKzEMmAfv/+ESmIRQhFDxRAxNpjwAmAhA05NBTCAUGAk7kuoXvnThI3eLcspgIgcw/NbiApkRxJqtwl7WySgEmECabmlZsUkea8B6In0wv2PvykVCDASpYTExr1oNTmVoVRhVylNtXey69bux79GtVaS7IgHEQ9izNm3bV3ubK1l8EfJQsCFPQTMNYXXYphkqbdS42Aurfa2gkAatgI4sV51WKhVgDBY8h+sYJYUCHOp3ZZ7SrOzFiSEk0ORktcU0YuaqIVWetGPPJIrgD7XApREDylZa27Z7b+oISd2Z3pjqtWnvxWbyMPn4MQSU2a9KLV8fLWmYSwvcfcfTk+cjm83rwdrhaAcuGk/fsXhpjXFMDB5zu2NPBIQHtgIAQDthgwgRAUBHhAEAA7'
  },
  mobikwik: {
    h: '19',
    col: gifBase64Prefix + 'R0lGODlhbAAfAKIHAJvl5ODt7UPS0L/w73/h4P///wDDwf///yH5BAEAAAcALAAAAABsAB8AAAP/eBfczgPIR4O6OOvNu/9gqBBFaWnDQAiCMYhwLM/cUJpHurZG77u0oHCYAdwKgJ9y2TsRn9CMjnUsEJjMQI8Q7QanPB/peFWulocW18sWlbFV609wC/cO27bek8QajFVvLjcDc3gGa3uKGIJLcXI9dISGPQCLlyN+gIE+NpM+AoWDKkaYbY0/j5CSn1uikXmmXqiVR5tlnq2IfQahSQKys0ysVmNyxCWvLm8ABIXAwVG0uQWIN1cBccoqPwAtlhm4HGVczQROB8XOMOSi0OFLxFfGK4/KAXaRG+L7eTwvF8IUYOdKnwZUubRYK3HO3o80cwAe7CGxCAtL/y68qQjC/5sAAO76zTnCwxg1kw8jVcwGDwiIjAd4cYwRcuKPbCbE2GP1ClgsfD9IZFr2A+CAixCBvLK0Q2KLdwo/skhhMKkAQcTCGDvSq5VPpcMGlsn3J4c/igp7KegDrRrFtVtw1XwTQBDOAsq2lvjlVZQNUM1AHRAkIZUoLv94vHNrAG6sf3L1yRwMimTQOJFaOWsy9sIrbm/T+QB5Vgk4BTwshIHmg7ILd0uHGjiibOENtpr7JK1IrvMFtoeTKnFSxtLwkJF7jda4xfJlrpmTdSpzqDEGd/wUwC6t5N12RJWKu6aqRGIZ2ku28uI5XW1rDGyzm+0VPAz5sgrE9HDLYv/42rL+UbYVEwNWtlcnT+2GQUniMUdfaeBshJohdkCTnHKxXGELHAx1F8FDari2WHv7lVAdaYgoOKFa81XSYor/+YCXDxYQUOAw3vgxRx5phXJUa2/4GEYA9YXWIheMGWBBkgAlB41igxnDi45UFuXYEi/Q4mKRLsn2QhgBvRcji2kFFgFZVer4zou9nIDLlOBwyRGUfSRSp4PkvfOGlmlisWYGRA6ADqApRANCAWj2mYWhmCQAADs='
  },
  payzapp: {
    h: '24',
    col: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAlCAMAAACtfZ09AAAAY1BMVEXuQEGBmb/+7+9BZZ/AzN/839/2n6DrICLpEBLxYGH7z9DsMDHvUFH4r7Dv8vf1j5Df5e/ycHHQ2edhf68iTI+gss8SP4dxjLcxWZewv9eQpcdRcqf5v8DzgIEDM3/oAQP///+4CVglAAAAIXRSTlP//////////////////////////////////////////wCfwdAhAAADRUlEQVR4Ab2Ue3PiOBDEZflh/DAG8whhpXV//095jKYlqyp1x20C239ESE755+6ZkcELZacaz/QyYN907Trg7wCdN7tV5N4PrJvjsEYZvBfo5rFdc9XvA9rJmzWJ6vAeYD93ubGknX0LsJ49RaUSelDv7VK7I6+1/x8YP3JGTKcHDoXqfoDoIr8vqGQBsJd1AeBXqgEmcdxwUlSNBVBzM9cKtCvVu5WyQPE7SgCH8KvU0wNweiznPVBHgwPNcjbGVNkGaNaoYwAmTPrcFsCv30kL8EFgJUul/E8A3Uo5miWwzXvpuCY5w1Q0jEYWNvh5AxbYXwncK/AUNkCdZp4GCbRrxkglE448NtsdwXfM4JuXjwCUJK+3wBDyfWGwm8Fag2v5qhAaplGB8nfqjwm4k2yTJikm8CnvBBCAYvBUBmAp+/AnL0anKY5GOAxt4HPn2BUR2AsfKEUXSOA7aM/cwJrdpZAC1POSHQOT6qQGpwiUtWO32FmsM/7G6GnNNrwwYHXyger2WK44C1xO6Jwdkwx6NdgiAqWcDZwsJnTsiHoIdAPUzjngEvvxsauhtaIKeXYhcNGzMp/f1ircE6hmKJc6Vv8DlPY9opaNdxKD1z2B0MMDsvFqGGJNIJ/wWdaxI2BgtStLfrcEDjFMnS/4DNQILIPpfNYGpjsiAtPgDS4LvvUQ4KRTy4GTwAcaLquqWog4FcWZwNgxyYajwdH7VsrEnmFttGMfmx4iE/bY1GqPx8YHG5XihXDKb23zpWjgIlL6EWn3Zey1JLERyY7a64Vwz29tsdHlQLh4jNSxGZDunbXy1+vYV/p28Nq+FoVGWnEwM4NdNOgfagOQgyfis34D9rLnfKp2AO5SKASdGCHKQLoz2WOaeRocY3xu2yKWGkkmYoYUy0jKLxrU8YxAXtupaB50O23AgecAv8xkwIjpUpd7dkaRDN6wAW/hBkKXzTw8IyTQfukZnwF7p6rhKAugekhLuDx+HdKvPaqw7/OZR5+avk/NgCh9eZLBt2RSon+i6dtAt/6ZBuN9GvwfGXwmM/omBfp94PQUtDOdn5wF9VNg+1/hHRke9Qpg8y/hzSm81wJt+zy8lwL98/BeCxwZ3vf0D5XUzxaJRoO1AAAAAElFTkSuQmCC'
  },
  payumoney: {
    h: '18',
    col:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI0AAAAgCAMAAAAYAgunAAAAMFBMVEXT46mRuSr7/PeGsxakxk/I3JXz9+fr8ti30nTj7sqyzmqcwD+sy17d6b2+1oL///+7L4YrAAAAEHRSTlP///////////////////8A4CNdGQAAA+xJREFUeNrNV4tuIyEMNAbMw0D+/29vbEi2Fylt79RInSgrwMaeHWykpdv/gXMY5fbT+F82smL6PWyYtM42C/8KNkDTCH1+C5v5W9iwwdiMn2fDhm9QuIYyMxGt3rP8LBuW1or9yqeMuMBN9lBKTgG62I6fBZWujjTyZw3SBlyyO3BOqY/wlg7vMQYHXna+9ssRSC5OGVFXTm9hE6Jmw4L4/bU462LTjM16F5t+CqNHbSwFEGEs4GHw0ZM2oa6kXY7VN1wDB5/ZY+phr4iwupH54yLY1DOhEGZbfaAqcmMmPLal5Mx/s4lBFxU386xjjDVZch+jnk3csi0/nBqMsJLstHPdfTlj68m/8gc2DWxIQ0oaopL0MMo21KjyxCaGvGNIDdEQ1ogOJRgka9wYlotzONPeMPM9AX/NImon4mGR9YlNI5pz0kBR5BDOe2ocH7Vpnvf0l9VdXVWNUF81Wav5ahh72V6pJRh9GhY7N105d/hO7jGQhyJw/cAmgw0zu/oYTo10J51vL7RhhCQRbLC8IhN56SZIUZuIEPJDnIwkhWF1rmWY9MxlBUSBbcnpE7IqFkOhD13SNM6SYpVDeprvxebSRpDdF7FGNs/gaVqk5mRXgCPXGPbUG6XpCTQVGYxAMRsiNFe6A8NlBOM2J1YDSQ3J3VZUeaUN2KgPKmK5wIhyg0Kn5vzNuTtlAKEmm0I0gawgUhDBSl1AxKgdBF2F0VMJADPaJ4cECM23F3XzTTbhsKmHTdCEn0awuRdOwcTrzbWpawoShaB3NlOR8pTND2sTNdgvaBZzybBSRJpTN/uiYtRVna3Z+RHLgGmXzWGjnnDqxabc2fR/0kYzZTIUturpgo0W4OopwPIXT2L9BG6W3svG/IAOqtQxtM55rU17NIRVsXD9WxuNQ3hj50qNecDnmc1poxYCMWyWM8V+jgcweX3Qy2s2cMZToLU1/PSeurSBnqYsrCJWvlztIBoU4ovNvQOpiLRqnWjbOk+c57nmLsCNX7PBc99+y28/D1se2tgtAOtaq6Yxd+SUu1cnhv1iY7dVGkNBUZx1GHruCiF9JgOIHjYDItzZ4D323Y9HmmxsQrm04dJNZWCfd0mYRa9OSsbpojNcAmv2x/Eob9us6sag1n4bslJ1M+kQdxr+viUPS5ZqYzO60x6UyxrSKr4nYbarsyHyBS6TcqYmvGe0Lu1YmhtncetZK7JplXK2+MK+Re+e7nQGvHch1MMMXxztwJiYn78GBP/HjGKkZyN//7viU+uVxnvv6y+Yoqbgu+H1Kl+wYVoJ0vCbuRTqGtHZX7CRgVLLb5eGUvSL4EttKri8HS3pmOzDP+UnwTXbEK2hAAAAAElFTkSuQmCC'
  }
}

var emi_options = sessProto.emi_options = {
  // minimum amount to enable emi
  min: 3000*100-1,
  installment: function(length, rate, principle){
    rate /= 1200;
    var multiplier = Math.pow(1+rate, length);
    return parseInt(principle*rate*multiplier/(multiplier - 1), 10);
  },

  selected: 'KKBK',
  banks: {
    KKBK: {
      patt: /4(04861|78006|34669|1(4767|664[3-6])|363(88|89|90))|5(24253|43705|47981)/,
      name: 'Kotak Mahindra Bank',
      plans: {
        3: 12,
        6: 12,
        9: 14,
        12: 14,
        18: 15,
        24: 15
      }
    },

    HDFC: {
      patt: /3608(25|26|86|87)|4(05028|18136|3(467(7|8)|6(306|520)|7546)|5(11|77)04|6178(6|7)|8(549(8|9)|9377))|5(176(35|52)|22852|24(111|181|216|368|931)|28945|33744|45(226|964)|5(2(088|2(60|74)|3(44|85))|6042|8818|9300|(358|515|898)3))/,
      name: 'HDFC Bank',
      plans: {
        3: 12,
        6: 12,
        9: 13,
        12: 13,
        18: 15,
        24: 15
      }
    },

    AXIS: {
      patt: /(436560|46111[6-8]|464118|524240|405995|55934[0-2]|(45(050|145)6)|(5245(08|12)))00|40743(903|(8|9)00)|524178(00|10|11)|5305620(0|2)|4111460(0|1)|45145(700|604)|4111460[2-5]|4182120(1|2)|47186(00(0|1|3)|10[0-2]|30[0-2]|400)/,
      name: 'Axis Bank'
    }
  }
}

emi_options.banks.AXIS.plans = emi_options.banks.HDFC.plans;

var tab_titles = sessProto.tab_titles = {
  card: 'Card/EMI',
  netbanking: 'Netbanking',
  wallet: 'Wallet'
}

function notifyBridge(message){
  if( message && message.event ){
    var bridgeMethod = CheckoutBridge['on' + message.event];
    var data = message.data;
    if(typeof data !== 'string'){
      if(!data){
        return invoke(bridgeMethod, CheckoutBridge);
      }
      data = stringify(data);
    }
    invoke(bridgeMethod, CheckoutBridge, data);
  }
}

function setPaymentMethods(session){
  var availMethods = preferences.methods;
  var methods = session.methods = {};

  each(
    availMethods,
    function(method, enabled){
      if(enabled && session.get('method.' + method) !== false){
        methods[method] = enabled;
      }
    }
  )

  if(session.get('amount') >= 100*10000 || availMethods.wallet instanceof Array){ // php encodes blank object as blank array
    methods.wallet = false;
  }

  each(
    session.get('external.wallets'),
    function(i, externalWallet){
      if(externalWallet in freqWallets){
        if(!methods.wallet){
          methods.wallet = {};
        }
        methods.wallet[externalWallet] = true;
        freqWallets[externalWallet].custom = true;
      }
    }
  )
}

function showModal(session) {
  if(!preferences){
    Razorpay.payment.getPrefs(session.get('key'), function(response){
      if(response.error){
        return Razorpay.sendMessage({event: 'fault', data: response.error.description});
      }
      response.user = null;
      response.tokens = {
        "entity": "collection",
        "count": 2,
        "items": [
          {
            "entity": "token",
            "token": "aslkdjflaksdjf",
            "method": "card",
            "card": {
              "last4": 1234,
              "network": "MasterCard",
              "emi": true,
              "bank": "HDFC"
            }
          },
          {
            "entity": "token",
            "token": "ofakjdflka;sdfj",
            "method": "card",
            "card": {
              "last4": 7890
            }
          }
        ]
      };
      preferences = response;
      showModalWithSession(session);
    })
    return;
  }
  Razorpay.configure(preferences.options);
  showModalWithSession(session);
}

function showModalWithSession(session){
  setPaymentMethods(session);
  session.render();
  trackInit(session);
  Razorpay.sendMessage({event: 'render'});

  if (CheckoutBridge) {
    $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
  }

  if(qpmap.error){
    session.errorHandler(qpmap);
  }
  if(qpmap.tab){
    session.switchTab($('#tabs > li[data-target=tab-' + qpmap.tab + ']'));
  }
}

function configureRollbar(id){
  if(Rollbar){
    invoke(
      Rollbar.configure,
      Rollbar,
      {
        payload: {
          person: {
            id: id
          },
          context: discreet.context
        }
      }
    );
  }
}

// generates ios event handling functions, like onload
function iosMethod(method){
  return function(data){
    var iF = document.createElement('iframe');
    var src = 'razorpay://on'+method;
    if(data){
      src += '?' + CheckoutBridge.index;
      CheckoutBridge.map[++CheckoutBridge.index] = data;
    }
    iF.setAttribute('src', src);
    document.documentElement.appendChild(iF);
    iF.parentNode.removeChild(iF);
    iF = null;
  }
}

var platformSpecific = {
  ios: function(){
    // setting up js -> ios communication by loading custom protocol inside hidden iframe
    CheckoutBridge = window.CheckoutBridge = {
      // unique id for ios to retieve resources
      index: 0,
      map: {},
      get: function(index){
        var val = this.map[this.index];
        delete this.map[this.index];
        return val;
      },

      getUID: function(){
        return _uid;
      }
    };

    var bridgeMethods = ['load','dismiss','submit','fault','success'];

    each(bridgeMethods, function(i, prop){
      CheckoutBridge['on'+prop] = iosMethod(prop)
    })
    CheckoutBridge.oncomplete = CheckoutBridge.onsuccess;
  },

  android: function(){
    doc.css('background', 'rgba(0, 0, 0, 0.6)');
  }
}

function setQueryParams(search){
  each(
    search.replace(/^\?/,'').split('&'),
    function(i, param){
      var split = param.split('=', 2);
      if( split[0].indexOf('.') !== -1 ) {
        var dotsplit = split[0].split('.', 2);
        if( !qpmap[dotsplit[0]] ) {
          qpmap[dotsplit[0]] = {};
        }
        qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
      } else {
        qpmap[split[0]] = decodeURIComponent(split[1]);
      }
    }
  )

  var platform = qpmap.platform;
  if(platform){
    addBodyClass(platform);
    invoke(platformSpecific[platform]);
  }
}

Razorpay.sendMessage = function(message){
  if ( CheckoutBridge && typeof CheckoutBridge === 'object' ) {
    return notifyBridge(message);
  }

  if(ownerWindow){
    message.source = 'frame';
    message.id = _uid;
    if ( typeof message !== 'string' ) {
      message = stringify(message);
    }
    ownerWindow.postMessage(message, '*');
  }
}

window.handleOTP = function(otp){
  var session = getSession();
  var otpEl = gel('otp');
  if(session && session.rzp && otpEl && !otpEl.value){
    otpEl.value = otp;
  }
}

function validUID(id){
  if(isIframe && !CheckoutBridge){
    if(typeof id !== 'string' || id.length < 14 || !/[0-9a-z]/i.test(id)){
      return false;
    }
  }
  return true;
}

window.handleMessage = function(message){
  if('id' in message && !validUID(message.id)){
    return;
  }
  var id = message.id || _uid;
  var session = getSession(id);
  if(!session){
    if(!message.options){
      return;
    }
    try{
      session = new Session(message.options);
    } catch(e){
      Razorpay.sendMessage({event: 'fault', data: e.message});
      return roll('fault ' + e.message, message, 'warn');
    }
    configureRollbar(id);
    var oldSession = getSession();
    if(oldSession){
      invoke('saveAndClose', oldSession);
    }
    session.id = _uid = id;
    sessions[_uid] = session;
  }

  if(message.context){
    discreet.context = message.context;
  }
  if(message.embedded){
    // addBodyClass('embedded');
  }
  if(message.config){
    RazorpayConfig = message.config;
  }
  if(message.event === 'open' || message.options){
    showModal(session);
  }
  else if(message.event === 'close'){
    session.hide();
  }
}

function parseMessage(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
  var data = e.data;
  if(e.source && e.source !== ownerWindow){
    return;
  }
  try{
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }
    window.handleMessage(data);
  } catch(err){
    roll('invalid message', data, 'warn');
  }
}

function trackInit(session){
  var options = session.get();
  if(/^rzp_l/.test(options.key)){
    track(session.id, 'init', options);
  }
}

function applyUAClasses(){
  if(/Android [2-4]/.test(ua)){
    addBodyClass('noanim');
  }
}

function initIframe(){
  $(window).on('message', parseMessage);
  Razorpay.sendMessage({event: 'load'});

  if(location.search){
    setQueryParams(location.search);
  }

  if(CheckoutBridge){
    discreet.medium = qpmap.platform || 'app';
  }

  if(qpmap.message){
    parseMessage({data: atob(qpmap.message)});
  }

  applyUAClasses();
}

initIframe();