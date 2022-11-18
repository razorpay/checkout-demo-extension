/* eslint-disable no-extend-native */

/**
 * Polyfill for Array.prototype.find
 * ref: https://github.com/jsPolyfill/Array.prototype.find/blob/master/find.js
 */
(function () {
  if (!Array.prototype.find) {
    Array.prototype.find = function (callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }

      var thisVal = arguments[1] || this;
      for (var i = 0; i < this.length; i++) {
        if (callback.call(thisVal, this[i], i, this)) {
          return this[i];
        }
      }
    };
  }
})();

/**
 * Polyfill for Array.prototype.includes
 */
(function () {
  if (!Array.prototype.includes) {
    Array.prototype.includes = function () {
      return Array.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }
})();

/**
 * Array.prototype.flat
 */
if (!Array.prototype.flat) {
  Object.defineProperty(Array.prototype, 'flat', {
    configurable: true,
    writable: true,
    value: function () {
      var depth =
        typeof arguments[0] === 'undefined' ? 1 : Number(arguments[0]) || 0;
      var result = [];
      var forEach = result.forEach;

      var flatDeep = function (arr, depth) {
        forEach.call(arr, function (val) {
          if (depth > 0 && Array.isArray(val)) {
            flatDeep(val, depth - 1);
          } else {
            result.push(val);
          }
        });
      };

      flatDeep(this, depth);
      return result;
    },
  });
}

/**
 * Array.prototype.flatMap
 */
(function () {
  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (callback, thisArg) {
      var self = thisArg || this;
      var list = [];

      // 1. Let O be ? ToObject(this value).
      var o = Object(self);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      for (var k = 0; k < len; ++k) {
        if (k in o) {
          var part_list = callback.call(self, o[k], k, o);
          list = list.concat(part_list);
        }
      }
      return list;
    };
  }
})();

/**
 * Array.prototype.findIndex
 * Polyfill for Array.prototype.findIndex
 * Source: https://github.com/jsPolyfill/Array.prototype.findIndex/blob/master/findIndex.js
 */
(function () {
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
})();
