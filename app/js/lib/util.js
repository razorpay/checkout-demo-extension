var now = Date.now || function() {
  return new Date().getTime();
};

/* Collections */

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

function map( iteratee, mapFunc ) {
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

function bind(func, thisArg){
  return function(){
    return func.apply(thisArg, arguments);
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
    try {
      if(arguments.length >= 3){
        return handler.call(thisArg, param);
      }
      return handler.call(thisArg);      
    } catch(e){
      roll('invoke error', e);
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


/* Objects */

function clone(target){
  return JSON.parse(stringify(target));
}

function isNonEmpty(obj){
  if (!obj) {
    return false;
  }
  if (obj instanceof Array) {
    return obj.length;
  }
  for (var i in obj) {
    return true;
  }
}

var stringify = bind(JSON.stringify, JSON);

/* DOM */

var qs = bind(document.querySelector, document);
var $$ =  bind(document.querySelectorAll, document);
var gel = bind(document.getElementById, document);

function submitForm(action, data, method, target) {
  if (typeof target !== 'string') {
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