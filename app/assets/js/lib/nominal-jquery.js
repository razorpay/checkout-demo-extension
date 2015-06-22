(function(root){
  var $ = root.$ = function(el){
    return {
      
      on: function(event, callback){
        if (window.addEventListener) {
          el.addEventListener(event, callback, false);
        } else if(window.attachEvent){
          el.attachEvent('on' + event, callback);
        }
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
})(Razorpay.prototype)