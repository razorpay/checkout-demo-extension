var now = Date.now || function() {
  return new Date().getTime();
};

// iphone/ipad restrict non user initiated focus on input fields
var ua = navigator.userAgent;
var ua_iOS = /iPhone|iPad/.test(ua);
var ua_prefer_redirect = /Windows Phone|UCBrowser|FBAN|\(iP.+((Cr|Fx)iOS)/;
var shouldFixFixed = /iPhone|Android 2\./.test(ua);
var shouldFocusNextField = !ua_iOS;

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

function isNonEmpty(obj){
  if (!obj) {
    return false;
  }
  if (isArray(obj)) {
    return obj.length;
  }
  for (var i in obj) {
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
    if (iteratee.length) { // not using instanceof Array, to iterate over nodeList
      for (i = 0; i < iteratee.length; i++) {
        eachFunc.call(thisArg, i, iteratee[i]);
      }
    } else {
      for (i in iteratee) {
        eachFunc.call(thisArg, i, iteratee[i]);
      }
    }
  }
}

function map(iteratee, mapFunc) {
  var result = iteratee instanceof Array ? [] : {};
  each(iteratee, function(i, val){
    result[i] = mapFunc(val, i);
  })
  return result;
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

function bind(func, thisArg) {
  return function(){
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
    // try {
      if (arguments.length >= 3) {
        return handler.call(thisArg, param);
      }
      return handler.call(thisArg);      
    // } catch(e) {
    //   roll('invoke error', e);
    // }
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
    if (method === 'get' && !isNonEmpty(data)) {
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

function preventDefault(e){
  if(e && e.preventDefault){
    e.preventDefault();
  }
}

/* Formatting */

function getChar(e) {
  if (e.ctrlKey) {
    return '';
  }
  return String.fromCharCode(e.which).replace(/[^\x20-\x7E]/, '');
}

function getSelection(el) {
  var value = el.value;
  var length = value.length;
  var caretPosition = el.selectionStart;
  var text = '';
  if (isNumber(caretPosition)) {
    if (caretPosition !== el.selectionEnd) {
      text = value.slice(caretPosition, el.selectionEnd);
    }
  } else if (document.selection) {
    var range = document.selection.createRange();
    text = range.text;
    var textInputRange = el.createTextRange();
    textInputRange.moveToBookmark(range.getBookmark());
    caretPosition = -textInputRange.moveStart('character', -length);
  }
  return {
    start: caretPosition,
    end: caretPosition + text.length
  };
}

function setCaret(el, position) {
  if (isNumber(el.selectionStart)) {
    return el.selectionStart = el.selectionEnd = position;
  } else {
    var range = el.createTextRange();
    range.collapse(true);
    range.moveEnd('character', position);
    range.moveStart('character', position);
    return range.select();
  }
}

function getParts(e) {
  var el;
  var newCharacter = '';
  if (e instanceof Node) {
    el = e;
  } else {
    newCharacter = getChar(e);
    el = e.target;
  }

  var selection = getSelection(el);
  var value = el.value

  if (!newCharacter) {
    return {
      pre: value.slice(0, selection.start),
      val: value
    }
  } else {
    e.preventDefault();
    var pre = value.slice(0, selection.start) + newCharacter;
    return {
      pre: pre,
      val: pre + value.slice(selection.end)
    }
  }
}

function stripNonDigit(str) {
  return str.replace(/\D/g, '')
}

function ensureNumeric(e) {
  return ensureRegex(e, /[0-9]/);
}

function ensurePhone(e) {
  return ensureRegex(e, e.target.value.length ? /[0-9]/ : /[+0-9]/);
}

function ensureExpiry(e) {
  var shouldSlashBeAllowed = /^\d{2} ?$/.test(e.target.value);
  return ensureRegex(e, shouldSlashBeAllowed ? /[\/0-9]/ : /[0-9]/);
}

function ensureRegex(e, regex) {
  if(!e) { return '' }

  var which = e.which;
  if (!isNumber(which)) {
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

function toggleInvalid($el, isValid) {
  $el.toggleClass('invalid', !isValid)
}