var EvtHandler;
(function(){
  EvtHandler = function(el) {
    this.el = el;
    this.listeners = [];
  }

  function getListener(el, event, callback) {
    var remover,
      adder = 'addEventListener';
    if (adder in window) {
      remover = 'removeEventListener';
    } else {
      adder = 'attachEvent';
      remover = 'detachEvent';
      event = 'on' + event;
    }
    el[adder](event, callback);
    return function() {
      el[remover](event, callback);
    };
  }

  function binder(callback, thisArg) {
    return function(e) {
      if (!e) { e = window.event }
      if (!e.target) { e.target = e.srcElement }
      if (!e.which) { e.which = e.charCode || e.keyCode }
      if (e.target.nodeType === 3) { e.target = e.target.parentNode }
      if (!e.preventDefault) {
        e.preventDefault = function() {
          return this.returnValue = false;
        }
      }
      callback.call(thisArg, e);
    }
  }

  EvtHandler.prototype = {
    on: function(event, el, callback) {
      var argLen = arguments.length;
      if (argLen === 1) {
        return each(
          event,
          function(event, callback){
            this.on(event, callback);
          },
          this
        )
      }
      else if (argLen === 2) {
        callback = el;
        el = this.el;
      }
      this.listeners.push(
        getListener(
          el,
          event,
          binder(callback, this)
        )
      )
      return this;
    },

    off: function() {
      for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i]();
      }
      this.listeners = [];
      return this;
    }
  };
})();