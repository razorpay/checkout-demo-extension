var pi = Math.PI;

function raise(message) {
  throw new Error(message);
}

var arrayProto = Array.prototype;
var slice = arrayProto.slice;
var roll = function() {};
var noop = roll;
var emo = {};

var now =
  Date.now ||
  function() {
    return new Date().getTime();
  };

// iphone/ipad restrict non user initiated focus on input fields
var ua = navigator.userAgent;
function isua(ua_regex) {
  return ua_regex.test(ua);
}

var is_ie8 = !window.addEventListener;
var ua_iPhone = isua(/iPhone/);
var ua_iOS = ua_iPhone || isua(/iPad/);

var ua_old_android = isua(/Android [2-4]/);

// android webview: /; wv\) |Gecko\) Version\/[^ ]+ Chrome/
// ios non safari: ua_iOS && !isua(/Safari/)
// note that chrome-ios also contains "Safari" in ua, but it is covered through "CriOS"
var ua_prefer_redirect =
  isua(
    /; wv\) |Gecko\) Version\/[^ ]+ Chrome|Windows Phone|Opera Mini|UCBrowser|FBAN|CriOS/
  ) ||
  (ua_iOS && (isua(/ GSA\//) || !isua(/Safari/))) ||
  (ua_old_android && !isua(/Chrome/));

var ua_popup_supported = !isua(/(Windows Phone|\(iP.+UCBrowser\/)/);
var shouldFixFixed = isua(/iPhone|Android 2\./);
var isWP = isua(/Windows Phone/);
var chromeVersion = ua.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  chromeVersion = parseInt(chromeVersion[1], 10);
}

var ua_ip7 = isua(/iPhone OS 7/);

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
  return x instanceof Element;
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

function arr2obj(array) {
  var obj = {};
  return (
    (array &&
      array.reduce(function(prev, next) {
        prev[next] = 1;
        return prev;
      }, obj)) ||
    obj
  );
}

function each(iteratee, eachFunc, thisArg) {
  var i;
  if (arguments.length < 3) {
    thisArg = this;
  }
  if (iteratee) {
    /**
     * 1. Not using instanceof Array, to iterate over array-like objects
     * 2. Not using `iteratee.length` inside `if` because 0 length arrays will
     *    then be considered as objects.
     * 3. Some browsers like webview on kitkat iterate over the `length`
     *    property of Arrays if iterated by `for-in` loop.
     * http://stackoverflow.com/questions/500504/why-is-using-for-in-with-array-iteration-a-bad-idea#comment315981_500531
     */
    if (typeof iteratee.length !== 'undefined') {
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
  if (arrayProto.indexOf) {
    return arr.indexOf(item);
  } else {
    var len = arr.length >>> 0;
    var from = Number(arguments[1]) || 0;
    from = from < 0 ? Math.ceil(from) : Math.floor(from);
    if (from < 0) {
      from += len;
    }

    for (; from < len; from++) {
      if (from in arr && arr[from] === item) {
        return from;
      }
    }
    return -1;
  }
}

function find(arr, predicate) {
  if (arrayProto.find) {
    return arr.find(predicate, arguments[2]);
  } else {
    var length = arr.length >>> 0;
    var thisArg = arguments[2];
    var value;

    for (var i = 0; i < length; i++) {
      value = arr[i];
      if (predicate.call(thisArg, value, i, arr)) {
        return value;
      }
    }
    return undefined;
  }
}

function findBy(arr, prop, value) {
  return find(arr, function(item) {
    return item[prop] === value;
  });
}

/* Functions */

function bind(func, thisArg, arg) {
  if (isString(func)) {
    func = thisArg[func];
  }
  var args = arguments;
  if (args.length >= 3) {
    return function() {
      func.apply(thisArg, slice.call(args, 2));
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

function defer(func, timeout) {
  if (arguments.length === 1) {
    timeout = 0;
  }
  if (arguments.length < 3) {
    setTimeout(func, timeout);
  } else {
    var args = arguments;
    setTimeout(function() {
      func.apply(null, slice.call(args, 2));
    }, timeout);
  }
}

function invoke(handler, thisArg, param, timeout) {
  if (isNumber(timeout)) {
    return setTimeout(function() {
      invoke(handler, thisArg, param);
    }, timeout);
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
    } catch (e) {
      roll('invoke', e);
    }
  }
}

function debounce(func, wait) {
  if (!wait) {
    return func;
  }
  var basetime = now();

  return function() {
    var args = arguments;

    function later() {
      func.apply(this, args);
    }

    // is current timestamp > basetime + waiting duration
    var since = basetime + wait - now();
    if (since <= 0) {
      since = null;
    }
    return invoke(later, this, null, since);
  };
}

function invokeEach(iteratee, thisArg) {
  each(
    iteratee,
    function(key, func) {
      func.call(thisArg);
    },
    thisArg
  );
}

function invokeOnEach(func, map) {
  each(map, function(key, val) {
    if (isString(func)) {
      func = val[func];
    }
    func.call(val);
  });
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
  each(map, function(key, val) {
    func.apply(thisArg, [key, val].concat(slice.call(args, declaredArgs)));
  });
}

/* Objects */

function clone(target) {
  return JSON.parse(stringify(target));
}

var stringify = bind(JSON.stringify, JSON);

/* DOM */

var qs = bind(document.querySelector, document);
var $$ = bind(document.querySelectorAll, document);
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

  if (method) {
    form.setAttribute('method', method);
  }
  if (target) {
    form.setAttribute('target', target);
  }
  if (data) {
    form.innerHTML = deserialize(data);
  }

  doc.appendChild(form);
  form.submit();
  doc.removeChild(form);
}

function deserialize(data, key) {
  if (isNonNullObject(data)) {
    var str = '';
    each(data, function(name, value) {
      if (key) {
        name = key + '[' + name + ']';
      }
      str += deserialize(value, name);
    });
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
  $el.toggleClass('invalid', !isValid);
}

function recurseAjax(url, callback, continueTill, holder, ajaxFn) {
  var firstCall;
  if (!holder) {
    holder = {};
    firstCall = true;
  }
  if (!ajaxFn) {
    ajaxFn = $.ajax;
  }
  defer(function() {
    if (!firstCall && !holder[0]) {
      return;
    }
    holder[0] = ajaxFn({
      url: url,
      callback: function(response) {
        if (continueTill(response)) {
          recurseAjax(url, callback, continueTill, holder, ajaxFn);
        } else {
          callback(response);
        }
      }
    });
  }, 1500);
  return holder;
}

function abortAjax(ajax) {
  if (ajax && ajax[0]) {
    ajax[0].abort();
    ajax[0] = null;
  }
}

//Return rgba value for hex color code
function hexToRgb(hex, alpha) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: (parseInt(result[1], 16) / 255).toFixed(1),
        green: (parseInt(result[2], 16) / 255).toFixed(1),
        blue: (parseInt(result[3], 16) / 255).toFixed(1),
        alpha: alpha || 1
      }
    : null;
}
