var pi = Math.PI;
var doc = document.documentElement;

function raise(message) {
  throw new Error(message);
}

var arrayProto = Array.prototype;
var slice = arrayProto.slice;
var roll = function () {};
var noop = roll;
var emo = {};

var now =
  Date.now ||
  function () {
    return new Date().getTime();
  };

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

/* Collections */
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

/* Functions */

function bind(func, thisArg, arg) {
  if (isString(func)) {
    func = thisArg[func];
  }
  var args = arguments;
  if (args.length >= 3) {
    return function () {
      func.apply(thisArg, slice.call(args, 2));
    };
  }
  return function () {
    return func.apply(thisArg, arguments);
  };
}

function invoke(handler, thisArg, param, timeout) {
  if (isNumber(timeout)) {
    return setTimeout(function () {
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
    each(data, function (name, value) {
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

function abortAjax(ajax) {
  if (ajax) {
    if (ajax.abort) {
      ajax.abort();
      ajax = null;
    } else if (ajax[0]) {
      ajax[0].abort();
      ajax[0] = null;
    }
  }
}
