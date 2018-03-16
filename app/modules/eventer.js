export default function Eventer() {
  // constructor is also called for resetting
  this._evts = {};

  // default listeners
  this._defs = {};
  // if called without `new` on Eventer instance
  return this;
}

Eventer.prototype = {
  onNew: noop,

  def: function(event, callback) {
    this._defs[event] = callback;
  },

  on: function(event, callback) {
    if (isString(event) && isFunction(callback)) {
      var events = this._evts;
      if (!events[event]) {
        events[event] = [];
      }
      if (this.onNew(event, callback) !== false) {
        events[event].push(callback);
      }
    }
    return this;
  },

  once: function(event, callback) {
    var everCallback = callback;
    var self = this;
    let onceCallback = function() {
      everCallback.apply(self, arguments);
      self.off(event, onceCallback);
    };
    callback = onceCallback;
    return this.on(event, callback);
  },

  off: function(event, callback) {
    var argLen = arguments.length;
    if (!argLen) {
      return Eventer.call(this);
    }

    var events = this._evts;

    if (argLen === 2) {
      var listeners = events[event];
      if (isFunction(callback) && isArray(listeners)) {
        listeners.splice(indexOf(listeners, callback), 1);
        if (listeners.length) {
          return;
        }
      } else {
        return;
      }
    }

    if (events[event]) {
      delete events[event];
    } else {
      // its a namespace
      event += '.';
      each(events, function(eventKey) {
        if (!eventKey.indexOf(event)) {
          delete events[eventKey];
        }
      });
    }

    return this;
  },

  emit: function(event, arg) {
    each(
      this._evts[event],
      function(i, callback) {
        try {
          callback.call(this, arg);
        } catch (e) {
          if (console.error) {
            console.error(e);
          }
        }
      },
      this
    );
    return this;
  },

  emitter: function() {
    return () => {
      this.emit.apply(this, arguments);
    };
  }
};
