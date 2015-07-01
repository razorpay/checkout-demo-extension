(function(root){
  var callListener = function(callback, el, e){
    if(/^key/.test(e.type)) !e.which && (e.which = e.keyCode);
    callback.call(el, e);
  }

  var $ = root.$ = function(el){
    if(typeof el == 'string') return $(document.getElementById(el));
    if(!(this instanceof $)) return new $(el);
    this[0] = el;
  }

  $.prototype = {
    on: function(event, callback, capture){
      var ref;
      var el = this[0];
      if (window.addEventListener) {
        ref = function(e){
          if(e.target.nodeType == 3) e.target = e.target.parentNode;// textNode target
          callListener(callback, this, e);
        }
        el.addEventListener(event, ref, !!capture);
      } else if(window.attachEvent){
        ref = function(e){
          if(!e) var e = window.event;
          if(!e.target) e.target = e.srcElement || document;
          if(!e.preventDefault) e.preventDefault = function(){this.returnValue = false};
          callListener(callback, el, e);
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
      this[0].parentNode && this[0].parentNode.removeChild(this[0]);
      return this;
    },

    hasClass: function(str){
      return (' ' + this[0].className + ' ').indexOf(' ' + str + ' ') >= 0;
    },

    addClass: function(str){
      if(!this.hasClass(str)) this[0].className += ' ' + str;
      return this;
    },

    removeClass: function(str){
      var el = this[0];
      className = (' ' + el.className + ' ').replace(' ' + str + ' ', ' ').replace(/^ | $/g,'');
      if(el.className != className) el.className = className;
      return this;
    },

    children: function(filterClass){
      var child = this[0].firstChild;
      var childList = [];
      while(child){
        if(child.nodeType == 1 && !filterClass || $(child).hasClass(filterClass)) childList.push(child);
        child = child.nextSibling;
      }
      return childList;
    },

    find: function(filterClass, filterTag){
      var node = this[0];
      if('getElementsByClassName' in document){
        return node.getElementsByClassName(filterClass);
      }
      var result = [];
      !filterTag && (filterTag = '*');
      var els = node.getElementsByTagName(filterTag);
      var elsLen = els.length;
      var pattern = new RegExp("(^|\\s)"+filterClass+"(\\s|$)");
      for (var i=0; i<elsLen; i++){
        if(pattern.test(els[i].className)) result.push(els[i]);
      }
      return result;
    },

    css: function(prop, value){
      var el = this[0];
      if(el){
        if(arguments.length == 1) return el.style[prop];
        el.style[prop] = value;
      }
    },

    attr: function(attr, value){
      var el = this[0];
      if(el){
        if(arguments.length == 1) return el.getAttribute(attr);
        el.setAttribute(attr, value);
      }
    },

    parent: function(){
      return $(this[0].parentNode)
    }
  }

  $.noop = function(){};

  $.extend = function(target, source){
    for(var o in source){
      target[o] = source[o]
    }
    return target
  };

  $.defaults = function(target, defaults){
    for(var i in defaults){
      if(!(i in target)) target[i] = defaults[i];
    }
    return target;
  }

})(Razorpay.prototype);
// })(window);