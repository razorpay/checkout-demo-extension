const typeChecker = type => x => typeof x === type;
export const isBoolean = typeChecker('boolean');
export const isNumber = typeChecker('number');
export const isString = typeChecker('string');
export const isFunction = typeChecker('function');
export const isObject = typeChecker('object');

// create getProperty function based on keys
export const getter = key => obj => obj && obj[key];

export const lengthOf = getter('length');
export const prototypeOf = getter('prototype');

export const isNonNullObject = o => o && isObject(o);
export const isEmptyObject = x => !lengthOf(keysOf(x));

// returns a partially applied function, awaiting for last parameter
export const curry2 = func =>
  function(arg1, arg2) {
    if (arguments.length < 2) {
      return primArg =>
        primArg === null ? null : func.call(null, primArg, arg1);
    }
    return func.call(null, arg1, arg2);
  };

export const curry3 = func =>
  function(arg1, arg2, arg3) {
    if (arguments.length < 3) {
      return primArg =>
        primArg === null ? null : func.call(null, primArg, arg1, arg2);
    }
    return func.call(null, arg1, arg2, arg3);
  };

export const isExact = curry2((x, y) => x && x.constructor === y);
export const is = curry2((x, y) => x instanceof y);

// array utils
export const isArray = Array.isArray;
export const isArrayLike = x => isNumber(lengthOf(x));

const stringProto = prototypeOf(String);
const arrayProto = prototypeOf(Array);

const arrayCall = method =>
  curry2((array, arg) => arrayProto[method].call(array, arg));
const slice = array => (isString(array) ? stringProto.slice : arrayProto.slice);

export const loopArray = curry2((array, iteratee) => {
  array && arrayProto.forEach.call(array, iteratee);
  return array;
});

export const any = arrayCall('some');
export const every = arrayCall('every');
export const map = arrayCall('map');
export const filter = arrayCall('filter');
export const indexOf = arrayCall('indexOf');
export const join = arrayCall('join');
export const contains = curry2((array, member) => indexOf(array, member) >= 0);

export const prepend = curry2((array, member) => {
  const newArray = Array(lengthOf(array) + 1);
  newArray[0] = member;
  loopArray(array, (member, index) => (newArray[index + 1] = member));
  return newArray;
});

export const append = curry2((array, member) => {
  const arrayLen = lengthOf(array);
  const newArray = Array(arrayLen + 1);
  newArray[arrayLen] = member;
  loopArray(array, (member, index) => (newArray[index] = member));
  return newArray;
});

export const remove = curry2((array, member) => {
  arrayProto.splice.call(array, indexOf(array, member), 1);
  return array;
});

export const drop = curry2((array, num) => slice(array).call(array, num));
export const dropLast = curry2((array, num) =>
  slice(array).call(array, 0, -num)
);
export const take = curry2((array, num) => slice(array).call(array, 0, num));
export const takeLast = curry2((array, num) => slice(array).call(array, -num));

export const first = array => array[0];
export const last = array => array[lengthOf(array) - 1];

export const reduce = curry3((array, reducer, initialValue) =>
  arrayProto.reduce.call(array, reducer, initialValue)
);

export const merge = curry2((arr1, arr2) => {
  const arr2Len = lengthOf(arr2);
  var combinedArray = Array(arr2Len + lengthOf(arr1));
  loopArray(arr2, (member, index) => (combinedArray[index] = member));
  loopArray(arr1, (member, index) => (combinedArray[index + arr2Len] = member));
  return combinedArray;
});

// object utils
export const keysOf = o => Object.keys(o);

export const has = curry2((o, prop) => prop in o);
export const get = curry2((o, key) => o[key]);
export const hasOwn = curry2((o, prop) => o && o.hasOwnProperty(prop));
export const getOwn = curry2((o, prop) => hasOwn(o, prop) && o[prop]);

export const set = curry3((o, key, value) => {
  o[key] = value;
  return o;
});

export const setIf = curry3((o, key, value) => {
  if (value) {
    o[key] = value;
  }
  return o;
});

export const unset = curry2((o, key) => {
  delete o[key];
  return o;
});

export const loopObject = curry2((o, iteratee) => {
  loopArray(keysOf(o), key => iteratee(o[key], key, o));
  return o;
});

// {a: 2, b: 3} → map(x => 2*x) → {a: 4, b: 6}
export const mapObject = curry2((o, iteratee) =>
  reduce(keysOf(o), (obj, key) => set(obj, key, iteratee(o[key], key, o)), {})
);

export const reduceObject = curry3((o, reducer, initialValue) =>
  reduce(
    keysOf(o),
    (accumulator, key) => reducer(accumulator, o[key], key, o),
    initialValue
  )
);

export const stringify = JSON.stringify;

export const objectify = string => {
  try {
    return JSON.parse(string);
  } catch (e) {
    error: e;
  }
};

export const clone = o => objectify(stringify(o));

export const extend = curry2((o, source) => {
  loopObject(source, (v, k) => (o[k] = v));
  return o;
});

export const noop = _ => _;
export const π = Math.PI;
export const pixelUnit = 'px';
export const emptyObject = {};

export const now = Date.now;
export const random = Math.random;
export const floor = Math.floor;

// function utils
export const timeout = (func, delay) => {
  var timerId = setTimeout(func, delay || 0);
  return ~clearTimeout(timerId);
};

export const interval = (func, delay) => {
  var timerId = setInterval(func, delay || 0);
  return ~clearInterval(timerId);
};

// returns a function which tells elapsed time at that point
// on each subsequent invocation
export const timer = x => {
  var then = now();
  return x => now() - then;
};

export function rawError(description, field) {
  var errorObj = {
    description: String(description)
  };

  if (field) {
    errorObj.field = field;
  }

  return errorObj;
}

export function rzpError(description, field) {
  return { error: rawError(description, field) };
}

export function throwMessage(message) {
  throw message;
}

export const isBase64Image = src => /data:image\/[^;]+;base64/.test(src);

export function obj2query(obj) {
  const objKeys = keysOf(obj);
  const serializedArray = Array(lengthOf(objKeys));

  objKeys
    |> loopArray(
      (objKey, index) =>
        (serializedArray[index] =
          encodeURIComponent(objKey) + '=' + encodeURIComponent(obj[objKey]))
    );

  return serializedArray.join('&');
}

export function query2obj(string) {
  var obj = {};
  string.split(/=|&/)
    |> loopArray((param, index, array) => {
      if (index % 2) {
        obj[array[index - 1]] = param;
      }
    });
  return obj;
}

export function appendParamsToUrl(url, params) {
  url += contains('?', url) ? '&' : '?';
  url += obj2query(params);
  return url;
}

//Return rgba value for hex color code
function hex2rgb(hex) {
  var colors = map(
    match => (parseInt(result[1], 16) / 255).toFixed(1),
    hex.slice(1).match(/.{2}/g)
  );

  return {
    red: colors[0],
    green: colors[1],
    blue: colors[2],
    alpha: 1
  };
}

// string utils

export const padString = str => ' ' + str + ' ';

// function utils
const funcProto = prototypeOf(Function);

export const setConstructorPrototype = (constructor, proto) => {
  proto.constructor = constructor;
  constructor.prototype = proto;
  return constructor;
};

// facilitate this.func, if func is passed as string
// getMethod('close', window) → window.close
const getMethod = (func, context) => (isString(func) ? context[func] : func);

// function utils are not curried due to variable length arguments and ambiguity
export const apply = (func, context, argsArray) => {
  func = getMethod(func, context);
  if (isFunction) {
    return func.apply(context, argsArray);
  }
};

export const applyArgs = (func, argsArray) => func.apply(null, argsArray);

export function call(func, context) {
  return apply(func, context, drop(arguments, 2));
}

export function callArgs(func) {
  return applyArgs(func, drop(arguments, 1));
}

export function bind(func, context) {
  func = getMethod(func, context);
  return func.bind.apply(func, drop(arguments, 1));
}

export function bindArgs(func) {
  return func.bind.apply(func, prepend(drop(arguments, 1), null));
}

// function, timeout, context, arg1, arg2...
export const delay = (func, delay, context) =>
  timeout(~apply(func, context, drop(arguments, 3)), delay || 0);

export const delayArgs = (func, delay) =>
  interval(~applyArgs(func, drop(arguments, 2)), delay || 0);

export const debounce = (func, wait) => {
  var timerId, args, context, timerFn, result;

  var later = function() {
    var last = timerFn();

    if (last < wait && last >= 0) {
      timerId = timeout(later, wait - last);
    } else {
      timerId = null;
      result = apply(func, context, args);
      if (!timerId) context = args = null;
    }
  };

  return function() {
    context = this;
    args = arguments;
    timerFn = timer();
    if (!timerId) timerId = timeout(later, wait);
    return result;
  };
};
