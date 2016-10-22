function raise(message){
  throw new Error(message);
}

var roll = function(){};
var noop = roll;
var emo = {};

var now = Date.now || function() {
  return new Date().getTime();
};

// iphone/ipad restrict non user initiated focus on input fields
var ua = navigator.userAgent;
function isua(ua_regex) {
  return ua_regex.test(ua);
}

var ua_iPhone = isua(/iPhone/);
var ua_iOS = ua_iPhone || isua(/iPad/);
var ua_prefer_redirect = isua(/Windows Phone|Opera Mini|UCBrowser|FBAN|\(iP.+((Cr|Fx)iOS)/);
var ua_popup_supported = !isua(/(Windows Phone|\(iP.+UCBrowser\/)/);
var shouldFixFixed = isua(/iPhone|Android 2\./);
var shouldFocusNextField = !ua_iOS;
var chromeVersion = ua.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  chromeVersion = parseInt(chromeVersion[1], 10);
}

/* simple checks */
function isBoolean(x) {
  return typeof x === 'boolean';
}

function isNumber(x) {
  return typeof x === 'number';
}

function isFunction(x) {
  return typeof x === 'function';
}

function isString(x) {
  return typeof x === 'string';
}

function isNonNullObject(x) {
  return x && typeof x === 'object';
}

function isArray(x) {
  return x instanceof Array;
}

function isNode(x) {
  return x instanceof Node;
}

function isEmptyObject(obj) {
  if (isNonNullObject(obj)) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  }
}

/* Collections */

function each(iteratee, eachFunc, thisArg) {
  var i;
  if (arguments.length < 3) {
    thisArg = this;
  }
  if (iteratee) {
    if (iteratee.length) { // not using instanceof Array, to iterate over array-like objects
      for (i = 0; i < iteratee.length; i++) {
        eachFunc.call(thisArg, i, iteratee[i]);
      }
    } else {
      for (i in iteratee) {
        if (iteratee.hasOwnProperty(i)) {
          eachFunc.call(thisArg, i, iteratee[i]);
        }
      }
    }
  }
}

function indexOf(arr, item) {
  if (Array.prototype.indexOf) {
    return arr.indexOf(item);
  } else {
    var len = arr.length >>> 0;
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0) {
      from += len;
    }

    for (; from < len; from++)
    {
      if (from in arr && arr[from] === item){
        return from;
      }
    }
    return -1;
  }
}

/* Functions */

function bind(func, thisArg, arg) {
  if (isString(func)) {
    func = thisArg[func];
  }
  if (arguments.length === 3) {
    return function() {
      func.call(this, arg);
    }
  }
  return function() {
    return func.apply(thisArg, arguments);
  }
}

function defer(func, timeout) {
  if (arguments.length === 1) {
    timeout = 0;
  }
  if (arguments.length < 3) {
    setTimeout(func, timeout);
  } else {
    var args = arguments;
    setTimeout(function(){
      func.apply(null, Array.prototype.slice.call(args, 2));
    }, timeout);
  }
}

function invoke(handler, thisArg, param, timeout) {
  if (isNumber(timeout)) {
    return setTimeout(
      function(){
        invoke(handler, thisArg, param)
      },
      timeout
    )
  }
  if (isString(handler)) {
    handler = thisArg && thisArg[handler];
  }
  if (isFunction(handler)) {
    if (!thisArg) {
      thisArg = this;
    }
    try {
      if (arguments.length >= 3) {
        return handler.call(thisArg, param);
      }
      return handler.call(thisArg);      
    } catch(e) {
      roll('invoke', e);
    }
  }
}

function debounce(func, wait, condition) {
  if (!wait) {
    return func;
  }
  var basetime = now();

  return function() {
    var args = arguments;

    function later(){
      // if condition is passed and is false, don't execute
      if (invoke(condition) === false) {
        return;
      }
      func.apply(this, args)
    }

    // is current timestamp > basetime + waiting duration
    var since = basetime + wait - now();
    if (since <= 0) {
      since = null;
    }
    return invoke(later, this, null, since);
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

function invokeOnEach(func, map) {
  each(
    map,
    function(key, val){
      if (isString(func)) {
        func = val[func];
      }
      func.call(val);
    }
  )
}

// possible values
// {}, this, function
// {}, this, 'func'
// {}, function
// {}, 'func'
// e.g. invokeEachWith(event, this, 'on', el, useCapture);

function invokeEachWith(map, func) {
  var args = arguments;
  var thisArg = this;
  var declaredArgs = 2;
  if (!isFunction(func)) {
    declaredArgs = 3;
    thisArg = arguments[2];
  }
  if (isString(func)) {
    func = thisArg[func];
  }
  each(
    map,
    function(key, val){
      func.apply(
        thisArg,
        [key, val].concat(Array.prototype.slice.call(args, declaredArgs))
      );
    }
  )
}


/* Objects */

function clone(target){
  return JSON.parse(stringify(target));
}

var stringify = bind(JSON.stringify, JSON);

/* DOM */

var qs = bind(document.querySelector, document);
var $$ =  bind(document.querySelectorAll, document);
var gel = bind(document.getElementById, document);

function submitForm(action, data, method, target) {
  if (!isString(target)) {
    if (method === 'get') {
      if (!target) {
        target = window;
      }
      target.location = action;
      return;
    } else if (target) {
      target = target.name;
    }
  }
  var form = document.createElement('form');
  form.setAttribute('action', action);

  if(method){ form.setAttribute('method', method) }
  if(target){ form.setAttribute('target', target) }
  if(data){ form.innerHTML = deserialize(data) }

  doc.appendChild(form);
  form.submit();
  doc.removeChild(form);
}

function deserialize(data, key) {
  if (isNonNullObject(data)) {
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

function preventDefault(e) {
  if (e instanceof Event) {
    e.preventDefault();
    e.stopPropagation();
  }
  return false;
}

/* Formatting */

function toggleInvalid($el, isValid) {
  $el.toggleClass('invalid', !isValid)
}

function recurseAjax(url, callback, continueTill, mature) {
  defer(function() {
    var xhr = $.ajax({
      url: url,
      callback: function(response) {
        if (continueTill.call(xhr, response)) {
          recurseAjax(url, callback, continueTill, true);
        } else {
          callback(response);
        }
      }
    })
    if (!mature) {
      continueTill.call(xhr);
    }
  }, 600)
}