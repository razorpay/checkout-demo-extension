import { returnAsIs } from 'lib/utils';
export default function Eventer() {
  // constructor is also called for resetting
  this._evts = {};

  // default listeners
  this._defs = {};
  // if called without `new` on Eventer instance
  return this;
}

Eventer.prototype = {
  onNew: returnAsIs,

  def: function (event, callback) {
    this._defs[event] = callback;
  },

  on: function (event, callback) {
    if (_.isString(event) && _.isFunction(callback)) {
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

  once: function (event, callback) {
    var everCallback = callback;
    var self = this;
    let onceCallback = function () {
      everCallback.apply(self, arguments);
      self.off(event, onceCallback);
    };
    callback = onceCallback;
    return this.on(event, callback);
  },

  off: function (event, callback) {
    var argLen = arguments.length;
    if (!argLen) {
      return Eventer.call(this);
    }

    var events = this._evts;

    if (argLen === 2) {
      var listeners = events[event];
      if (_.isFunction(callback) && _.isArray(listeners)) {
        listeners.splice(listeners.indexOf(callback), 1);
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
      _Obj.loop(events, function (val, eventKey) {
        if (!eventKey.indexOf(event)) {
          delete events[eventKey];
        }
      });
    }

    return this;
  },

  emit: function (event, arg) {
    (this._evts[event] || []).forEach((callback) => {
      try {
        callback.call(this, arg);
      } catch (e) {
        if (console.error) {
          console.error(e);
        }
      }
    });
    return this;
  },

  emitter: function () {
    return () => {
      this.emit.apply(this, arguments);
    };
  },
};
