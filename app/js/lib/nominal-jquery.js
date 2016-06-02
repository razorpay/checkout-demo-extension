var $ = function(el){
  if (typeof el === 'string') {
    return $(document.querySelector(el));
  }
  if (!(this instanceof $)) {
    return new $(el);
  }
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

function isNonEmpty(obj){
  if (obj instanceof Array) {
    return obj.length;
  }
  var i;
  if (i in obj) {
    return true;
  }
}

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
    if(arguments.length >= 3){
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
        if(!e.stopPropagation) { e.stopPropagation = e.preventDefault }
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
    if (el) {
      if(arguments.length === 1){
        return el.getAttribute(attr);
      }
      el.setAttribute(attr, val);
    }
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
        var json;
        try{
          json = JSON.parse(xhr.responseText);
        } catch(e){
          json = {error: {description: 'Parsing error'}};
        }
        opts.callback(json);
      }
    }
    xhr.onerror = function(){
      opts.callback({error: {description: 'Network error'}});
    }
  }
  xhr.send(opts.data || null);
  return xhr;
}
