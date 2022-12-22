/* eslint-disable no-extend-native */

/**
 * Polyfill for String.prototype.endsWith
 * ref: https://vanillajstoolkit.com/polyfills/stringendswith/
 */

(function () {
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchStr, Position) {
      // This works much better than >= because
      // it compensates for NaN:
      if (!(Position < this.length)) {
        Position = this.length;
      } else {
        Position |= 0; // round position
      }
      return (
        this.substr(Position - searchStr.length, searchStr.length) === searchStr
      );
    };
  }
})();

/**
 * Polyfill for String.prototype.padStart
 * ref: https://github.com/behnammodi/polyfill/blob/master/string.polyfill.js
 */
(function () {
  if (!String.prototype.padStart) {
    Object.defineProperty(String.prototype, 'padStart', {
      configurable: true,
      writable: true,
      value: function (targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length > targetLength) {
          return String(this);
        }
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return padString.slice(0, targetLength) + String(this);
      },
    });
  }
})();
