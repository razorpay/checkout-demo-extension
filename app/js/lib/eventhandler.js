var EventHandler;

(function(){

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

  function bind(callback, thisArg) {
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

  EventHandler = function(el) {
    this.el = el;
    this.listeners = [];
  }

  EventHandler.prototype = {
    on: function(event, callback, el) {
      this.listeners.push(
        getListener(
          el || this.el,
          event,
          bind(callback, this)
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
