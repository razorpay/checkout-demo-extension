/**
 * Returns the curried version of a function with two arguments
 * @param {Function} func
 *
 * @returns {Function}
 */
export const curry2 = (func: (arg1: any, arg2?: any) => any) =>
  function (arg1: any, arg2?: any) {
    if (arguments.length < 2) {
      return (primArg: any) => func.call(null, primArg, arg1);
    }
    return func.call(null, arg1, arg2);
  };

/**
 * Returns the curried version of a function with three arguments
 * @param {Function} func
 *
 * @returns {Function}
 */
export const curry3 = (func: (arg1: any, arg2: any, arg3?: any) => any) =>
  function (arg1: any, arg2: any, arg3?: any) {
    if (arguments.length < 3) {
      return (primArg: any) => func.call(null, primArg, arg1, arg2);
    }
    return func.call(null, arg1, arg2, arg3);
  };

/**
 * Validates the arguments with the given validators
 * before invoking the function.
 * i-th argument is validated using the i-th validator.
 * @param  {...(function (arg: *): boolean)} validators
 *
 * @returns {*}
 */
export function validateArgs(
  ...validators: Array<(...validatorArgs: any) => boolean>
) {
  return (func: (...funcArg: any) => any) =>
    function (...args: any) {
      if (
        validators.every((v: any, i: number) => {
          if (v(args[i])) {
            return true;
          }
          console.error(`wrong ${i}th argtype`, args[i]);
          global.dispatchEvent(
            new (CustomEvent as any)('rzp_error', {
              detail: new Error(`wrong ${i}th argtype ${args[i]}`),
            })
          );
        })
      ) {
        return func.apply(null, [...args]);
      }
      return args[0];
    };
}

/**
 * Matches the type of the first argument with the second argument using typeof operator and returns true or false
 * @param {*} x
 * @param {string} type
 *
 * @returns {boolean}
 */
export const isType = curry2((x, type) => typeof x === type);

/**
 * Returns true or false if the argument passed is boolean or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isBoolean = isType('boolean');

/**
 * Returns true or false if the argument passed is number or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isNumber = isType('number');

/**
 * Returns true or false if the argument passed is string or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isString: (arg: unknown) => arg is string = isType('string');

/**
 * Returns true or false if the argument passed is function or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isFunction = isType('function');

/**
 * Returns true or false if the argument passed is object or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isObject = isType('object');

/**
 * Returns true or false if the argument passed is array or not
 * @param {*} x
 *
 * @returns {boolean}
 */
export const isArray = Array.isArray;

/**
 * Tells whether something is undefined
 * @param {*} x
 *
 * @returns {Boolean}
 */
export const isUndefined = isType('undefined');

/**
 * Tells whether something is null
 * @param {*} x
 *
 * @returns {Boolean}
 */
export const isNull = (x: any) => x === null;

/**
 * Tells whether something is a regex
 * @param {*} x
 *
 * @returns {Boolean}
 */
export const isRegExp = (x: unknown): x is RegExp =>
  Object.prototype.toString.call(x) === '[object RegExp]';

/**
 * Tells whether something is of a primitive type
 * @param {*} x
 *
 * @returns {Boolean}
 */
export const isPrimitive = (x: any) =>
  isString(x) || isNumber(x) || isBoolean(x) || isNull(x) || isUndefined(x);

/**
 * Checks if the given argument is an element or not
 * @param {Object|Element} o
 *
 * @returns {boolean}
 */
export const isElement = (o: Common.Object | Element) =>
  isNonNullObject(o) && o.nodeType === 1;

/**
 * Checks if the given argument is truthy or not
 * @param {*} o
 *
 * @returns {boolean}
 */
export const isTruthy = Boolean;

/**
 * Checks if the given argument is not a null object
 * @param {Object} o
 *
 * @returns {boolean}
 */
export const isNonNullObject = (o: Common.Object) => !isNull(o) && isObject(o);

/**
 * Checks if the given object is empty or not
 * @param {Object} x
 *
 * @returns {boolean}
 */
export const isEmptyObject = (x: Common.Object) => !lengthOf(Object.keys(x));

/**
 * Returns the given property of the provided object
 * @param {Object} obj
 * @param {string} key
 *
 * @returns {*}
 */
export const prop = curry2((obj, key) => obj && obj[key]);

/**
 * Returns the length property of the given argument
 * @param {Array | string} x
 *
 * @returns {Object}
 */
export const lengthOf = prop('length');

/**
 * Returns the prototype property of the given argument
 * @param {x} x
 *
 * @returns {Object}
 */
export const prototypeOf = prop('prototype');

/**
 * Checks if the first parameter is an instance of second parameter class
 * @param {*} x
 * @param {class} y
 *
 * @returns {boolean}
 */
export const is = curry2((x, y) => x instanceof y);

export const pixelUnit = 'px';

export const now = Date.now;
export const random = Math.random;
export const floor = Math.floor;

/**
 * Returns a function that returns the time
 * that has passed since this function was
 * invoked.
 *
 * @returns {function (): number}
 */
export const timer = () => {
  const then = now();
  return () => now() - then;
};

/**
 * Gives raw error object consisting of description and field.
 * @param {string} description
 * @param {string} field
 *
 * @returns {Object}
 */
export function rawError(description: string, field = '') {
  const errorObj: { description: string; field?: string } = {
    description: String(description),
  };
  if (field) {
    errorObj.field = field;
  }
  return errorObj;
}

/**
 * Gives error object consisting of description and field.
 * @param {string} description
 * @param {string} field
 *
 * @returns {Object}
 */
export function rzpError(description: string, field = '') {
  return { error: rawError(description, field) };
}

/**
 * Throws error with message as given in the argument
 * @param {string} message
 *
 * @throws {Error}
 */
export function throwMessage(message: string) {
  throw new Error(message);
}

/**
 * Checks if the given argument is Base64 Image string or not
 * @param {string} src
 *
 * @returns {boolean}
 */
export const isBase64Image = (src: string) =>
  /data:image\/[^;]+;base64/.test(src);

/**
 * Gives a flattened object that can be used to generate query strings.
 * @param {Object} obj The source object
 * @param {string} prefix An optional prefix
 * @example
 * { foo: ['a', 'b'] } into { 'foo[0]': 'a', 'foo[1]': 'b' }
 *
 * @return {Object}
 */
export function makeQueryObject(obj: Common.Object, prefix?: string) {
  const query: Common.Object<string> = {};

  if (!isNonNullObject(obj)) {
    return query;
  }

  const noPrefix = typeof prefix === 'undefined' || prefix === null;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const _prefix = noPrefix ? key : `${prefix}[${key}]`;

    if (typeof value === 'object') {
      const _query = makeQueryObject(value, _prefix);

      Object.keys(_query).forEach((subkey) => {
        query[subkey] = _query[subkey];
      });
    } else {
      query[_prefix] = value;
    }
  });

  return query;
}

/**
 * Returns query string generated from the provided object.
 * @param {Object} obj
 *
 * @returns {string}
 */
export function obj2query(obj: Common.Object<any>) {
  const query: Common.Object<string> = makeQueryObject(obj);

  return Object.keys(query)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(query[key] as any)}`
    )
    .join('&');
}

/**
 * Returns an object converted from the provided query string
 * @param {string} string
 *
 * @returns {Object}
 */
export function query2obj(string: string) {
  // TODO: Support objects and nested objects.

  const obj: Common.Object = {};
  string.split(/=|&/).forEach((param, index, array) => {
    if (index % 2) {
      obj[array[index - 1]] = decodeURIComponent(param);
    }
  });
  return obj;
}

/**
 * Appends params to the URL from an object
 * @param {string} url
 * @param {Object} params
 *
 * @returns {string}
 */
export function appendParamsToUrl(
  url: string,
  params: Common.Object<string | number> | string
) {
  let updatedParams = params;
  if (isNonNullObject(params as Common.Object<string>)) {
    updatedParams = obj2query(params as Common.Object<string>);
  }
  if (updatedParams) {
    url += url?.indexOf('?') > 0 ? '&' : '?';
    url += updatedParams;
  }
  return url;
}

/**
 * Returns keycode of the key pressed when the event was fired
 * @param {Event} e
 *
 * @returns {number}
 */
export const getKeyFromEvent = (e: KeyboardEvent) =>
  is(e, global.Event) && (e.which || e.charCode || e.keyCode);

export const getCharFromEvent = (e: KeyboardEvent) => {
  const which = getKeyFromEvent(e);
  return (
    (which &&
      !e.ctrlKey &&
      String.fromCharCode(which).replace(/[^\x20-\x7E]/, '')) ||
    ''
  );
};

/**
 * Gives a list of query params
 * @param {string} search
 *
 *
 * @returns {Object} URL query params converted into an object.
 */
export const getQueryParams = function (search = location.search) {
  // TODO: Support objects and nested objects.
  if (isString(search)) {
    return query2obj(search.slice(1));
  }

  return {};
};

/**
 * Creates an IE-compatible Custom Event
 * Source: https://stackoverflow.com/a/26596324/4176188
 * @param {string} event
 * @param {Object} params
 *
 * @returns {Event}
 */
export function CustomEvent(event: string, params: Common.Object) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };

  const evt = document.createEvent('CustomEvent');

  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

  return evt;
}
