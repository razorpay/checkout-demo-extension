var Eventer;

!function() {
  Eventer = function(){
    this._events = {}
  };
  Eventer.prototype = {
    on: function(event, callback, namespace) {
      if (typeof callback !== 'function') {
        return;
      }
      var events = this._events;

      if(namespace){
        if(!(namespace in events)) {
          events[namespace] = {};
        }
        events = events[namespace];
      } else {
        var eventSplit = event.split('.');
        if (eventSplit.length > 1) {
          return this.on(eventSplit[1], callback, eventSplit[0]);
        }
      }

      var eventMap = events[event];
      if (!(eventMap instanceof Array)) {
        eventMap = events[event] = [];
      }
      eventMap.push(callback);
      return this;
    },

    once: function(event, callback) {
      var self = this;
      return this.on(
        event,
        function(arg) {
          self.off(event, callback);
          callback(arg);
        }
      )
    },

    off: function(event, callback) {
      var argLen = arguments.length;

      if(argLen === 1){
        delete this._events[event];
      } else if (!argLen) {
        this._events = {};
      } else {
        var eventSplit = event.split('.');
        var eventMap = this._events[eventSplit[0]];
        if (eventSplit.length > 1){
          eventMap = eventMap[eventSplit[1]];
        }
        eventMap.splice(indexOf(eventMap, callback), 1);
      }
      return this;
    },

    emit: function(event, arg) {
      var eventSplit = event.split('.');
      var eventMap = this._events[eventSplit[0]];
      if (eventMap && eventSplit.length > 1) {
        eventMap = eventMap[eventSplit[1]];
      }
      if (eventMap) {
        // .on('event') based callback
        if(eventMap instanceof Array){
          for (var i = 0; i < eventMap.length; i++) {
            eventMap[i].call(this, arg);
          }
        // onEvent based callback
        } else {
          eventMap(arg);
        }
      }
      return this;
    },

    emitter: function(event, args) {
      var self = this;
      return function(){ self.emit(event, args) }
    }
  }
}()