var $ = function(el){
  if(typeof el === 'string') { return $(document.getElementById(el)) }
  if(!(this instanceof $)) { return new $(el) }
  this[0] = el;
};

var each = function( iteratee, eachFunc ) {
  var i;
  if( iteratee ) {
    if ( iteratee.length ) { // not using instanceof Array, to iterate over nodeList
      for ( i = 0; i < iteratee.length; i++ ) {
        eachFunc(i, iteratee[i]);
      }
    }
    else {
      for ( i in iteratee ) {
        eachFunc(i, iteratee[i]);
      }
    }
  }
}

var map = function( iteratee, mapFunc ) {
  var result = iteratee instanceof Array ? [] : {};
  each(iteratee, function(i, val){
    result[i] = mapFunc(val, i);
  })
  return result;
}

var deserialize = function(data, key){
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

$.prototype = {
  on: function(event, callback, capture){
    var el = this[0];
    if(!el){
      return;
    }
    var ref;
    if (window.addEventListener) {
      ref = function(e){
        if( e.target.nodeType === 3 ) {
          e.target = e.target.parentNode;// textNode target
        }
        callback.call(this, e);
      }
      el.addEventListener(event, ref, !!capture);
    } else if(window.attachEvent){
      ref = function(e){
        if(!e) { e = window.event }
        if(!e.target) { e.target = e.srcElement || document }
        if(!e.preventDefault) { e.preventDefault = function() { this.returnValue = false } }
        callback.call(el, e);
      }
      el.attachEvent('on' + event, ref);
    }
    return ref;
  },

  off: function(event, callback, capture){
    if (window.removeEventListener) {
      this[0].removeEventListener(event, callback, !!capture);
    } else if(window.detachEvent){
      this[0].detachEvent('on' + event, callback);
    }
  },

  remove: function(){
    try{
      this[0].removeChild(el);
    } catch(e){}
    return this;
  },

  hasClass: function(str){
    return (' ' + this[0].className + ' ').indexOf(' ' + str + ' ') >= 0;
  },

  addClass: function(str){
    var el = this[0];
    if(!el.className) { el.className = str }
    else if(!this.hasClass(str)) { el.className += ' ' + str }
    return this;
  },

  removeClass: function(str){
    var el = this[0];
    var className = (' ' + el.className + ' ').replace(' ' + str + ' ', ' ').replace(/^ | $/g,'');
    if(el.className !== className) { el.className = className }
    return this;
  },

  children: function(filterClass){
    var child = this[0].firstChild;
    var childList = [];
    while(child){
      if(child.nodeType === 1 && !filterClass || $(child).hasClass(filterClass)) {
        childList.push(child);
      }
      child = child.nextSibling;
    }
    return childList;
  },

  find: function(filterClass, filterTag){
    var node = this[0];

    if('getElementsByClassName' in document){
      return node.getElementsByClassName(filterClass);
    }

    if( !filterTag ) {
      filterTag = '*';
    }

    var els = node.getElementsByTagName(filterTag);
    var pattern = new RegExp("(^|\\s)"+filterClass+"(\\s|$)");

    var result = [];
    each(els, function(i, el){
      if( pattern.test(el.className) ) {
        result.push(el);
      }
    })
    return result;
  },

  css: function(prop, value){
    var el = this[0];
    if(el){
      if( arguments.length === 1 ) {
        return el.style[prop];
      }
      try {
        el.style[prop] = value;
      } catch(e){} // IE can not set invalid css rules without throwing up.
    }
    return this;
  },

  attr: function(attr, value){
    var el = this[0];
    if(el){
      if( arguments.length === 1 ) {
        return el.getAttribute(attr);
      }
      el.setAttribute(attr, value);
    }
  },

  parent: function(){
    return $(this[0].parentNode)
  }
}

$.noop = noop;

$.clone = function(target){
  return JSON.parse(JSON.stringify(target));
};

$.deleteCookie = function(name){
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
};

$.setCookie = function(name, value){
  document.cookie = name + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
};

$.getCookie = function(name){
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
};

// setInterval(function(){
//   receive_cookie = readCookie('rzp-receive')
//   if(receive_cookie){
//     handleMessage(JSON.parse(receive_cookie));
//     c('rzp-receive', '', -1);
//   }
// }, 400)

// $.sendMessage = function(message, win){
//   if(typeof message !== 'string'){
//     message = JSON.stringify(message);
//   }

  // if(win){
    // win.postMessage(message, '*');
  // }

  // if(_$crossCookie){
  //   _$createCookie('submitPayload', message);
  // }
// }

var _$listener = null;

var _$createListener = function(callback, context){
  return function(e){
    if(!e || !e.data || typeof callback !== 'function'){
      return;
    }
    var data = e.data;
    if(typeof data === 'string'){
      try {
        data = JSON.parse(data);
      }
      catch(e){
        data = {
          error: {
            description: 'Unable to parse response'
          }
        }
      }
    }
    callback.call(context, e, data);
  }
};

$.addMessageListener = function(callback, context) {
  if(_$listener){
    $.removeMessageListener();
  }
  _$listener = $(window).on('message', _$createListener(callback, context));
};

$.removeMessageListener = function() {
  $(window).off('message', _$listener);
  _$listener = null;
};

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
    error: options.error || $.noop,
    success: options.success || $.noop,
    complete: options.complete || $.noop,
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
  while(str.length < length) str += Math.random().toString(36)[2];
  return str
};

$.ajax = function(options){
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