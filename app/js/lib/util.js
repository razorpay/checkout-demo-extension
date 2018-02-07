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
var ua_Android = isua(/Android/);
var ua_WP = isua(/Windows Phone/);

var ua_old_android = isua(/Android [2-4]/);

// android webview: /; wv\) |Gecko\) Version\/[^ ]+ Chrome/
// ios non safari: ua_iOS && !isua(/Safari/)
// note that chrome-ios also contains "Safari" in ua, but it is covered through "CriOS"
var ua_prefer_redirect =
  isua(
    /; wv\) |Gecko\) Version\/[^ ]+ Chrome|Windows Phone|Opera Mini|UCBrowser|FBAN|CriOS/
  ) ||
  // can't detect webview reliably
  ua_iOS ||
  (ua_old_android && !isua(/Chrome/));

var ua_popup_supported = !isua(/(Windows Phone|\(iP.+UCBrowser\/)/);
var shouldFixFixed = isua(/iPhone|Android 2\./);
var isWP = isua(/Windows Phone/);
var chromeVersion = ua.match(/Chrome\/(\d+)/);
if (chromeVersion) {
  chromeVersion = parseInt(chromeVersion[1], 10);
}

var ua_mobile = isua(/Android/) || ua_iOS;

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
  if (ajax && ajax.abort) {
    ajax.abort();
    ajax = null;
    return;
  }
  if (ajax && ajax[0]) {
    ajax[0].abort();
    ajax[0] = null;
  }
}

//Return rgba value for hex color code
function hexToRgb(hex, alpha) {
  if (!hex) {
    return null;
  }
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

function isAndroidBrowser() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    ) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}
