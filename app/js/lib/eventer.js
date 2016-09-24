var Eventer;

(function() {
  Eventer = function() {
    // constructor is also called for resetting
    this._evts = {};
    this._evtns = {};
    this._onNewListener = noop;

    // if called without `new` on Eventer instance
    return this;
  };

  Eventer.prototype = {
    on: function(event, callback) {
      if (typeof event === 'string' && typeof callback === 'function') {
        var events = this._evts,
          namespaces = this._evtns,
          eventSplit = event.split('.');

        // register event with namespace
        if (eventSplit.length > 1) {
          var ns = eventSplit[0];

          if (!namespaces[ns]) {
            namespaces[ns] = {};
          }
          namespaces[ns][eventSplit.slice(1).join('.')] = null;
        }

        if (events[event]) {
          events[event].push(callback);
        } else {
          events[event] = [callback];
        }
        this._onNewListener(event);
      }

      return this;
    },

    once: function(event, callback) {
      var everCallback = callback;
      function onceCallback() {
        everCallback.apply(this, arguments);
        this.off(event, onceCallback);
      }
      callback = onceCallback;
      return this.on(event, callback);
    },

    off: function(event, callback) {
      var argLen = arguments.length;

      if(!argLen) {
        return Eventer.call(this);
      }

      var events = this._evts,
        namespaces = this._evtns,
        eventSplit = event.split('.');

      if (argLen === 2) {
        var listenerArray = events[event];
        if (listenerArray) {
          listenerArray.splice(indexOf(listenerArray, callback), 1);
          if (listenerArray.length) {
            return this;
          }
        }
      }

      var ns = eventSplit[0];
      var nsEvents = namespaces[ns];
      if (nsEvents) {
        each(
          nsEvents,
          function(eventName) {
            delete events[ns + '.' + eventName];
          }
        )
        if (isEmptyObject(nsEvents)) {
          delete namespaces[ns];
        }
      }

      delete events[event];
      return this;
    },

    emit: function(event, arg) {
      each(this._evts[event], function(i, callback) {
        try {
          callback.call(this, arg);
        } catch(e) {
          if (console.error) {
            console.error(e);
          }
        }
      }, this)
      return this;
    },

    emitter: function() {
      var args = arguments;
      return bind(function() {
        this.emit.apply(this, args);
      }, this);
    }
  }
})();
