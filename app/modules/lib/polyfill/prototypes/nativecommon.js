/* eslint-disable no-extend-native */
/* global Set */

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
