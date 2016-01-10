var $ = function(el){
  if(typeof el === 'string') {
    return $(document.querySelector(el))
  }
  if(!(this instanceof $)) { return new $(el) }
  this[0] = el;
};

function $$(query){
  return document.querySelectorAll(query);
}

function gel(id){
  return document.getElementById(id);
}

var each = function( iteratee, eachFunc, thisArg ) {
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

  html: function(html){
    if(arguments.length){
      this[0].innerHTML = html;
      return this;
    }
    return this[0].innerHTML;
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
      catch(errorObj){
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

$.post = function(opts){
  var xhr = new XMLHttpRequest();
  xhr.open('post', opts.url, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  if(opts.callback){
    xhr.onreadystatechange = function(){
      if(xhr.readyState === 4 && xhr.status === 200){
        opts.callback(JSON.parse(xhr.responseText));
      }
    }
  }

  var payload = [];
  each(opts.data, function(key, val){
    payload.push(key + '=' + val)
  })
  xhr.send(payload.join('&'));
}