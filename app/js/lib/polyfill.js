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
// Ref: https://blog.bitsrc.io/lets-implement-our-own-array-map-sort-methods-e89c9d5e2dc8
if (!Array.prototype.sort) {
  Array.prototype.sort = function (compareFn) {
    return mergeSort(this);
    // Split the array into halves and merge them recursively
    function mergeSort(arr) {
      if (arr.length === 1) {
        // return once we hit an array with a single item
        return arr;
      }
      const middle = Math.floor(arr.length / 2); // get the middle item of the array rounded down
      const left = arr.slice(0, middle); // items on the left side
      const right = arr.slice(middle); // items on the right side
      return merge(mergeSort(left), mergeSort(right));
    }
    // compare the arrays item by item and return the concatenated result
    function merge(left, right) {
      let result = [];
      let indexLeft = 0;
      let indexRight = 0;
      while (indexLeft < left.length && indexRight < right.length) {
        //compareFn ? compareFn =()=> left[indexLeft] < right[indexRight] : compareFn
        let _left = left[indexLeft];
        let _right = right[indexRight];
        if (compareFn) compareFn = composeCompareFn(compareFn(left, right));
        compareFn = (l, r) => l < r;
        if (compareFn(_left, _right)) {
          result.push(left[indexLeft]);
          indexLeft++;
        } else {
          result.push(right[indexRight]);
          indexRight++;
        }
      }
      return result
        .concat(left.slice(indexLeft))
        .concat(right.slice(indexRight));
    }
    function composeCompareFn(compareResult) {
      if (Math.sign(compareResult) == -1) return false;
      if (Math.sign(compareResult) == 1) return true;
      if (compareResult == 0) return false;
    }
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
