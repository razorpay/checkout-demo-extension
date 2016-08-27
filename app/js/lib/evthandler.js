var EvtHandler;

!function(){
  EvtHandler = function(el, thisArg) {
    this.thisArg = arguments.length > 1 ? thisArg : this;
    this.el = el;
    this.listeners = [];
  }

  function getListener(el, event, callback, useCapture) {
    el.addEventListener(event, callback, useCapture);
    return function() {
      el.removeEventListener(event, callback, useCapture);
    };
  }

  function binder(callback, thisArg) {
    return function(e) {
      if (!e) { e = window.event }
      if (!e.target) { e.target = e.srcElement }
      if (e.target.nodeType === 3) { e.target = e.target.parentNode }
      if (!e.preventDefault) {
        e.preventDefault = function() {
          return e.returnValue = false;
        }
      }
      if (typeof callback === 'string') {
        callback = thisArg[callback];
      }
      if (typeof callback === 'function') {
        callback.call(thisArg, e);
      }
    }
  }

  EvtHandler.prototype = {
    on: function(event, callback, el, useCapture) {

      // event can be string or a map {event: callback}
      if (typeof event !== 'string') {
        for (var eventName in event) {
          this.on(eventName, event[eventName], callback, el);
        }
        return;
      }

      // if el is not specified, i.e. number of args is 2 or 3
      if (!(el instanceof Node)) {
        useCapture = el;
        el = this.el;
      }
      this.listeners.push(
        getListener(
          el,
          event,
          binder(callback, this.thisArg),
          useCapture
        )
      )
      return this;
    },

    off: function() {
      this.listeners.forEach(function(listener){
        listener();
      })
      this.listeners = [];
      return this;
    }
  };
}()