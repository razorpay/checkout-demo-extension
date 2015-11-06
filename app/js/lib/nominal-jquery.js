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
    if(!el) { return }

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

  hasClass: function(str){
    return (' ' + this.prop('className') + ' ').indexOf(' ' + str + ' ') >= 0;
  },

  addClass: function(str){
    if(str){
      if(!this.prop('className')){
        this.prop('className', str);
      }
      else if(!this.hasClass(str)){
        this[0].className += ' ' + str;
      }
    }
    return this;
  },

  removeClass: function(str){
    var className = (' ' + this.prop('className') + ' ').replace(' ' + str + ' ', ' ').replace(/^ | $/g,'');
    if( this.prop('className') !== className ){
      this.prop( 'className', className );
    }
    return this;
  },

  children: function(filterClass){
    var child = this.prop('firstChild');
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
    var result = [];
    var node = this[0];
    if(node){
      if('getElementsByClassName' in document){
        return node.getElementsByClassName(filterClass);
      }

      if( !filterTag ) {
        filterTag = '*';
      }

      var els = node.getElementsByTagName(filterTag);
      var pattern = new RegExp("(^|\\s)"+filterClass+"(\\s|$)");

      each(els, function(i, el){
        if( pattern.test(el.className) ) {
          result.push(el);
        }
      })
      return result;
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

  parent: function(){
    return $(this.prop('parentNode'));
  },

  html: function(html){
    return this.prop('innerHTML', html);
  },

  focus: function(){
    if(this[0]){
      this[0].focus();
    }
    return this;
  }
}

$.clone = function(target){
  return JSON.parse(JSON.stringify(target));
};

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