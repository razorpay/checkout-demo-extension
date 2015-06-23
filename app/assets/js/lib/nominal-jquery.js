(function(root){
  var callListener = function(callback, el, e){
    if(/^key/.test(e.type)) !e.which && (e.which = e.keyCode);
    callback.call(el, e);
  }
  
  var $ = root.$ = function(el){
    return {
      on: function(event, callback, capture){
        var ref;
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

      off: function(event, callback){
        if (window.removeEventListener) {
          el.removeEventListener(event, callback, false);
        } else if(window.detachEvent){
          el.detachEvent('on' + event, callback);
        }
      }
    }
  };

  $.noop = function(){};

  $.extend = function(target, source){
    for(o in source){
      target[o] = source[o]
    }
    return target
  };
})(Razorpay.prototype);