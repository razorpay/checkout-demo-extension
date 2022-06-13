/**
 *
 * @param {Object} object
 * @param {String | Array<String>} path
 * @param {Any} defval
 * @returns {any}
 */
export function get(object, path, defval = null) {
  if (typeof path === 'string') {
    path = path.split('.');
  }
  return path.reduce(
    (xs, x) => (xs && typeof xs[x] !== 'undefined' ? xs[x] : defval),
    object
  );
}

/**
 *
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isNonNullObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Check if the object has any key value pairs or is empty
 * @param {Object} o
 *
 * @returns {boolean}
 */
export const isEmpty = (obj) => !Object.keys(obj || {}).length;
