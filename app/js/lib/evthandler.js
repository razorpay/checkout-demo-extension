var EvtHandler;
(function(){
  EvtHandler = function(el) {
    this.el = el;
    this.listeners = [];
  }

  function getListener(el, event, callback, useCapture) {
    el.addEventListener(event, callback, useCapture);
    return function() {
      el[remover](event, callback, useCapture);
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
    on: function(event, callback, el, useCapture) {

      // event can be string or a map {event: callback}
      if (isNonNullObject(event)) {
        // args = assuming eventMap, el, useCapture
        return invokeEachWith(event, 'on', this, callback, el);
      }
      if (!isNode(el)) {
        useCapture = el;
        el = this.el;
      }
      this.listeners.push(
        getListener(
          el,
          event,
          binder(callback, this),
          useCapture
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