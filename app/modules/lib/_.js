const typeChecker = type => x => typeof x === type;
export const isBoolean = typeChecker('boolean');
export const isNumber = typeChecker('number');
export const isString = typeChecker('string');
export const isFunction = typeChecker('function');
export const isObject = typeChecker('object');

export const isArray = Array.isArray;

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

export const pixelUnit = 'px';

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
  const objKeys = Object.keys(obj);
  const serializedArray = Array(lengthOf(objKeys));

  objKeys.forEach(
    (objKey, index) =>
      (serializedArray[index] =
        encodeURIComponent(objKey) + '=' + encodeURIComponent(obj[objKey]))
  );

  return serializedArray.join('&');
}

export function query2obj(string) {
  var obj = {};
  string.split(/=|&/).forEach((param, index, array) => {
    if (index % 2) {
      obj[array[index - 1]] = param;
    }
  });
  return obj;
}

export function appendParamsToUrl(url, params) {
  url += url.indexOf('?') > 0 ? '&' : '?';
  url += obj2query(params);
  return url;
}

//Return rgba value for hex color code
function hex2rgb(hex) {
  var colors = hex
    .slice(1)
    .match(/.{2}/g)
    .map(match => (parseInt(result[1], 16) / 255).toFixed(1));

  return {
    red: colors[0],
    green: colors[1],
    blue: colors[2],
    alpha: 1
  };
}
