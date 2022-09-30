/**
 *
 * @param {Object} object
 * @param {String | Array<String>} path
 * @param {Any} defval
 * @returns {any}
 */
export function get(
  object: Record<string, any>,
  path: string | string[],
  defaultValue: any = null
): any {
  if (!isNonNullObject(object)) {
    return object;
  }
  if (typeof path === 'string') {
    path = path.split('.');
  }
  return path.reduce((xs, x) => {
    if (xs && typeof xs[x] !== 'undefined') {
      return xs[x];
    }
    return defaultValue;
  }, object);
}

/**
 *
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isNonNullObject(obj: Common.Object) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Check if the object has a property
 * @param {Object} obj
 * @param {string} prop
 *
 * @returns {boolean}
 */
export const hasProp = (obj: Common.Object, prop: string) =>
  isNonNullObject(obj) ? prop in obj : false;

/**
 * Check if the object has any key value pairs or is empty
 * @param {Object} o
 *
 * @returns {boolean}
 */
export const isEmpty = (obj: Common.Object) => !Object.keys(obj || {}).length;

/**
 * Loops through the object and maps new value according to the iteratee function
 * @param {Object} o
 * @param {function (value: *, key: string, o: Object): void} iteratee
 * @example
 * {a: 2, b: 3} → map(x => 2*x) → {a: 4, b: 6}
 *
 * @returns {Object}
 */
export const map = (
  obj: Common.Object,
  modifier: (value: any, key: any, obj: Common.Object) => Common.Object
) =>
  Object.keys(obj).reduce((newObject: Common.Object, key) => {
    newObject[key] = modifier(obj[key], key, obj);
    return newObject;
  }, {});

/**
 * Flattens the object by turning nested object into object with delimiters in the keys
 * @param {Object} o
 * @param {string} prefix [prefix='']
 *
 * @returns {Object}
 */

export const flatten = (o: Common.Object = {}, prefix = '') => {
  const result: Common.Object<string | number> = {};
  Object.entries(o).forEach(([key, val]) => {
    const flattenedKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      Object.assign(result, flatten(val, flattenedKey));
    } else {
      result[flattenedKey] = val;
    }
  });
  return result;
};

/**
 * Unflattens the object by turning delimiters into nested object structure
 * @param {Object} o
 *
 * @returns {Object}
 */
export const unflatten = (o: Common.Object = {}) => {
  const delimiter = '.';
  const result: Common.Object = {};
  let temp;

  Object.entries(o).forEach(([key, val]) => {
    // Remove square brackets and replace them with delimiter.
    key = key.replace(/\[([^[\]]+)\]/g, `${delimiter}$1`);

    const keys = key.split(delimiter);
    let res = result;

    keys.forEach((k, i) => {
      /**
       * For all keys except the last, create objects and set to res.
       * For the last key, set the value in res.
       */
      if (i < keys.length - 1) {
        if (!res[k]) {
          res[k] = {};
        }

        temp = res[k];
        res = temp;
      } else {
        res[k] = val;
      }
    });
  });

  return result;
};

export const getOwnProp = (obj: Common.Object, prop: string) => {
  if (obj.hasOwnProperty(prop)) {
    return obj[prop];
  }
  return false;
};

/**
 * Clone an object from the previous object
 * @param {Object} o
 * @throws {TypeError} Will throw an exception if the object to clone is circular.
 *
 * @returns {Object}
 */
export const clone = (obj: Common.Object) =>
  isNonNullObject(obj) ? JSON.parse(JSON.stringify(obj)) : obj;

export const loop = (
  obj: Common.Object,
  iteratee: (value: any, key: any, obj: Common.Object) => void
) => {
  if (isNonNullObject(obj)) {
    Object.keys(obj).forEach((key) => iteratee(obj[key], key, obj));
  }
};

/**
 * Parse a string into JSON
 * @param {string} string
 *
 * @returns {Object}
 */
export const parse = (string: string) => {
  try {
    return JSON.parse(string);
  } catch (e: any) {
    console.error(e.message);
  }
};
