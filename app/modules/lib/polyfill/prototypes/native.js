/* eslint-disable no-extend-native */
/* global Set */

/**
 * Polyfill for String.prototype.includes
 */
(function() {
  if (!String.prototype.includes) {
    String.prototype.includes = function() {
      return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }
})();

/**
 * Polyfill for Array.prototype.includes
 */
(function() {
  if (!Array.prototype.includes) {
    Array.prototype.includes = function() {
      return Array.prototype.indexOf.apply(this, arguments) !== -1;
    };
  }
})();

/**
 * Polyfill for String.prototype.startsWith
 */
(function() {
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function() {
      return String.prototype.indexOf.apply(this, arguments) === 0;
    };
  }
})();

/*
 * Polyfill for Array.from
 */
(function() {
  if (!Array.from) {
    Array.from = (function() {
      var toStr = Object.prototype.toString;
      var isCallable = function(fn) {
        return (
          typeof fn === 'function' || toStr.call(fn) === '[object Function]'
        );
      };
      var toInteger = function(value) {
        var number = Number(value);
        if (isNaN(number)) {
          return 0;
        }
        if (number === 0 || !isFinite(number)) {
          return number;
        }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      var maxSafeInteger = Math.pow(2, 53) - 1;
      var toLength = function(value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };
      var setToArray = function(set) {
        var values = [];

        set.forEach(value => values.push(value));

        return values;
      };

      // The length property of the from method is 1.
      return function from(arrayLike /*, mapFn, thisArg */) {
        /**
         * 🚨🚨🚨🚨
         * IMPORTANT
         * 🚨🚨🚨🚨
         * Use custom handler for Set.
         *
         * DO NOT REMOVE THE FOLLOW if-BLOCK
         * OTHERWISE CHECKOUT WILL BREAK ON IE 11
         *
         * We are doing this because Symbol is not present on IE 11
         * and adding a Symbol polyfill does nothing because
         * we would also need to polyfill Set.prototype[Symbol.iterator]
         * and that somehow did not work after 3 hours of debugging.
         */
        if (arrayLike instanceof Set) {
          return setToArray(arrayLike);
        }

        // 1. Let C be the this value.
        var C = this;

        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);

        // 3. ReturnIfAbrupt(items).
        // eslint-disable-next-line eqeqeq
        if (arrayLike == null) {
          throw new TypeError(
            'Array.from requires an array-like object - not null or undefined'
          );
        }

        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
          // 5. else
          // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
          if (!isCallable(mapFn)) {
            throw new TypeError(
              'Array.from: when provided, the second argument must be a function'
            );
          }

          // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }

        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);

        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method
        // of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);

        // 16. Let k be 0.
        var k = 0;
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] =
              typeof T === 'undefined'
                ? mapFn(kValue, k)
                : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;
        // 20. Return A.
        return A;
      };
    })();
  }
})();

/**
 * Polyfill for Array.prototype.fill
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#Polyfill
 */
(function() {
  if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
      value: function(value) {
        // Steps 1-2.
        // eslint-disable-next-line eqeqeq
        if (this == null) {
          throw new TypeError('this is null or not defined');
        }

        var O = Object(this);

        // Steps 3-5.
        var len = O.length >>> 0;

        // Steps 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;

        // Step 8.
        var k =
          relativeStart < 0
            ? Math.max(len + relativeStart, 0)
            : Math.min(relativeStart, len);

        // Steps 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ? len : end >> 0;

        // Step 11.
        var finalValue =
          relativeEnd < 0
            ? Math.max(len + relativeEnd, 0)
            : Math.min(relativeEnd, len);

        // Step 12.
        while (k < finalValue) {
          O[k] = value;
          k++;
        }

        // Step 13.
        return O;
      },
    });
  }
})();

/**
 * Polyfill for Object.assign
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
 */
(function() {
  if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) {
        // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true,
    });
  }
})();

// Fix Function#name on browsers that do not support it (IE)
// We're using `global.alert.name` and not `function f() {}.name` because
// `function f` becomes an anonymous function in the generated bundle
if (!global.alert.name) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      var name = (this.toString()
        .replace(/\n/g, '')
        .match(/^function\s*([^\s(]+)/) || [])[1];
      // For better performance only parse once, and then cache the
      // result through a new accessor for repeated access.
      Object.defineProperty(this, 'name', { value: name });
      return name;
    },

    configurable: true,
  });
}
