import * as _ from './_';

/**
 * Tells whether argument passed is similar to an array.
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isSimilar = (x) => _.isNumber(_.lengthOf(x));

const proto = _.prototypeOf(Array);
const protoSlice = proto.slice;

/**
 * Loops through the array and calls
 * iteratee with each item.
 * Equal to Array.prototype.forEach.
 * @param {Array} array
 * @param {Function} iteratee
 *
 * @returns {Array}
 */
export const loop = _.curry2((array, iteratee) => {
  array && proto.forEach.call(array, iteratee);
  return array;
});

/**
 * Invokes all functions in the array.
 * @param {Array<Function>} array
 */
export const callAll = (array) => loop(array, (a) => a());

const arrayCall = (func) => _.curry2((arr, arg) => proto[func].call(arr, arg));

/**
 * Says whether `fn` evaluates to true
 * for at least one element of `array`.
 * Array.prototype.some
 * @param {Array} array
 * @param {function (item: *): boolean} fn
 *
 * @returns {boolean}
 */
export const any = arrayCall('some');

/**
 * Says whether `fn` evaluates to true
 * for every element of `array`.
 * Array.prototype.every
 * @param {Array} array
 * @param {function (item: *): boolean} fn
 *
 * @returns {boolean}
 */
export const every = arrayCall('every');

/**
 * Says whether `fn` evaluates to false
 * for every element of `array`.
 * Array.prototype.some
 * @param {Array} array
 * @param {function (item: *): boolean} fn
 *
 * @returns {boolean}
 */
export const none = _.curry2((arr, evalutor) => !any(arr, evalutor));

/**
 * Returns a new function by mapping every
 * element of the array into a new element.
 * @param {Array} array
 * @param {function (item: *): *} mapper
 *
 * @returns {Array}
 */
export const map = arrayCall('map');

/**
 * Returns a new array consisting of elements
 * from the orignal array that pass
 * the filter.
 * @param {Array} array
 * @param {function (item: *): boolean} filterer
 *
 * @returns {Array}
 */
export const filter = arrayCall('filter');

/**
 * Returns the index of the item in the array.
 * @param {Array} array
 * @param {*} item
 *
 * @returns {number}
 */
export const indexOf = arrayCall('indexOf');

/**
 * Returns a string by joining the elements of tha array.
 * @param {Array} array
 * @param {string} delimeter
 *
 * @returns {string}
 */
export const join = arrayCall('join');

/**
 * Returns a sorted array while sorting the array in place too.
 * @param {Array} array
 * @param {function (first: *, second: *): number} sorter Returns 1 if a > b, -1 if b > a, 0 if a == b
 *
 * @returns {Array}
 */
export const sort = arrayCall('sort');

/**
 * Tells whether or not an array contains the given member.
 * @param {Array} array
 * @param {Any} member
 *
 * @returns {boolean}
 */
export const contains = _.curry2(
  (array, member) => indexOf(array, member) >= 0
);

/**
 * Prepends an item to an array.
 * @param {Array} array
 * @param {Any} member
 *
 * @returns {Array}
 */
export const prepend = _.curry2((array, member) => {
  const newArray = Array(_.lengthOf(array) + 1);
  newArray[0] = member;
  loop(array, (member, index) => (newArray[index + 1] = member));
  return newArray;
});

/**
 * Appends an item to an array.
 * @param {Array} array
 * @param {Any} member
 *
 * @returns {Array}
 */
export const append = _.curry2((array, member) => {
  const arrayLen = _.lengthOf(array);
  const newArray = Array(arrayLen + 1);
  newArray[arrayLen] = member;
  loop(array, (member, index) => (newArray[index] = member));
  return newArray;
});

/**
 * Returns the first item of the array.
 * @param {Array} array
 *
 * @returns {Any}
 */
export const first = (array) => array[0];

/**
 * Returns the last item of the array.
 * @param {Array} array
 *
 * @returns {Any}
 */
export const last = (array) => array[_.lengthOf(array) - 1];

/**
 * Array.prototype.reduce
 * @param {Array} array
 * @param {function (accumulator: *, currentValue: *): *} reducer
 * @param {Any} initialValue
 *
 * @returns {Any}
 */
export const reduce = _.curry3((array, reducer, initialValue) =>
  proto.reduce.call(array, reducer, initialValue)
);
