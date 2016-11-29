var $ = function(el){
  if (isString(el)) {
    return $(document.querySelector(el));
  }
  if (!(this instanceof $)) {
    return new $(el);
  }
  this[0] = el;
};

$.prototype = {
  on: function(event, callback, capture, thisArg){
    var el = this[0];
    if(!el) { return }

    var ref;
    if (isString(callback)) {
      callback = thisArg[callback];
    }
    if (!isFunction(callback)) {
      return;
    }
    var shouldAddListener = window.addEventListener;
    if (shouldAddListener) {
      ref = function(e){
        if( e.target.nodeType === 3 ) {
          e.target = e.target.parentNode;// textNode target
        }
        return callback.call(thisArg || this, e);
      }
    } else {
      ref = function(e) {
        if(!e) { e = window.event }
        if(!e.target) { e.target = e.srcElement || document }
        if(!e.preventDefault) { e.preventDefault = function() { this.returnValue = false } }
        if(!e.stopPropagation) { e.stopPropagation = e.preventDefault }
        if(!e.currentTarget) { e.currentTarget = el }
        return callback.call(thisArg || el, e);
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
      return el && el[prop];
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
    if (isNonNullObject(attr)) {
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
      if (val) {
        el.setAttribute(attr, val);
      } else {
        el.removeAttribute(attr);
      }
    }
    return this;
  },

  reflow: function(){
    this.prop('offsetHeight');
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

  $: function(selector) {
    return $(this.qs(selector));
  },

  qs: function(selector) {
    var node = this[0];
    if (node) {
      return node.querySelector(selector);
    }
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

  bbox: function() {
    if (this[0]) {
      return this[0].getBoundingClientRect();
    }
    return emo;
  },

  height: function() {
    if (this[0]) {
      return this.bbox().height;
    }
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

function smoothScrollTo(y) {
  smoothScrollBy(y - pageYOffset);
}

var scrollTimeout;
function smoothScrollBy(y) {
  if (!window.requestAnimationFrame) {
    return scrollBy(0, y);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(function() {
    var y0 = pageYOffset;
    var target = Math.min(y0 + y, $(body).height());
    y = target - y0;
    var scrollCount = 0;
    var oldTimestamp = performance.now();

    function step (newTimestamp) {
      scrollCount += (newTimestamp - oldTimestamp)/200;
      if (scrollCount >= 1) {
        return scrollTo(0, target);
      }
      var sin = Math.sin(pi*scrollCount/2);
      scrollTo(0, y0 + Math.round(y*sin));
      oldTimestamp = newTimestamp;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 100)
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

$.ajax = function(opts) {
  var xhr = new XMLHttpRequest();
  if (!opts.method) {
    opts.method = 'get';
  }
  xhr.open(opts.method, opts.url, true);

  each(
    opts.headers,
    function(header, value){
      xhr.setRequestHeader(header, value);
    }
  )

  if(opts.callback) {
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4 && xhr.status) {
        var json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch(e) {
          json = discreet.error('Parsing error');
          json.xhr = {
            status: xhr.status,
            text: xhr.responseText
          };
        }
        opts.callback(json);
      }
    }
    xhr.onerror = function() {
      var resp = discreet.error('Network error');
      resp.xhr = {
        status: 0
      }
      opts.callback(resp);
    }
  }

  var data = opts.data || null;

  // ghostery
  if (chromeVersion <= 33) {
    invoke('send', xhr, data, 1000);
  } else {
    xhr.send(data);
  }
  return xhr;
}
