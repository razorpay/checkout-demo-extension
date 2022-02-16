/* jshint ignore:start */
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
/**
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
 */
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';

    if (search instanceof RegExp) {
      throw TypeError('first argument must not be a RegExp');
    }
    if (start === undefined) {
      start = 0;
    }
    return this.indexOf(search, start) !== -1;
  };
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function (search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function (callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    var thisVal = arguments[1] || this;
    for (var i = 0; i < this.length; i++) {
      if (callback.call(thisVal, this[i], i, this)) {
        return i;
      }
    }

    return -1;
  };
}
/* jshint ignore:end */
