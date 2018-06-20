export const noop = _ => _;

const funcProto = _.prototypeOf(Function);

export const setPrototype = (constructor, proto) => {
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
  if (_.isFunction(func)) {
    return func.apply(context, argsArray);
  }
};

export const applyArgs = (func, argsArray) => func.apply(null, argsArray);

export function call(func, context) {
  return apply(func, context, arr.sliceFrom(arguments, 2));
}

export function callArgs(func) {
  return applyArgs(func, arr.sliceFrom(arguments, 1));
}

export function bind(func, context) {
  func = getMethod(func, context);
  return func.bind.apply(func, arr.sliceFrom(arguments, 1));
}

export function bindArgs(func) {
  return func.bind.apply(func, arr.prepend(arr.sliceFrom(arguments, 1), null));
}

// function, timeout, context, arg1, arg2...
export const delay = (func, delay, context) =>
  _.timeout(
    () => apply(func, context, arr.sliceFrom(arguments, 3)),
    delay || 0
  );

export const delayArgs = (func, delay) =>
  _.interval(() => applyArgs(func, arr.sliceFrom(arguments, 2)), delay || 0);

export const debounce = (func, wait) => {
  var timerId, args, context, timerFn, result;

  var later = function() {
    var last = timerFn();

    if (last < wait && last >= 0) {
      timerId = _.timeout(later, wait - last);
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
