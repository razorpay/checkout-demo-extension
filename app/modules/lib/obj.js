export const keys = o => Object.keys(o);

export const has = _.curry2((o, prop) => prop in o);
export const get = _.curry2((o, key) => o[key]);
export const hasOwn = _.curry2((o, prop) => o && o.hasOwnProperty(prop));
export const getOwn = _.curry2((o, prop) => hasOwn(o, prop) && o[prop]);

export const set = _.curry3((o, key, value) => {
  o[key] = value;
  return o;
});

export const setIf = _.curry3((o, key, value) => {
  if (value) {
    o[key] = value;
  }
  return o;
});

export const unset = _.curry2((o, key) => {
  delete o[key];
  return o;
});

export const loop = _.curry2((o, iteratee) => {
  arr.loop(keys(o), key => iteratee(o[key], key, o));
  return o;
});

// {a: 2, b: 3} → map(x => 2*x) → {a: 4, b: 6}
export const map = _.curry2((o, iteratee) =>
  arr.reduce(keys(o), (obj, key) => set(obj, key, iteratee(o[key], key, o)), {})
);

export const reduce = _.curry3((o, reducer, initialValue) =>
  arr.reduce(
    keys(o),
    (accumulator, key) => reducer(accumulator, o[key], key, o),
    initialValue
  )
);

export const stringify = JSON.stringify;

export const parse = string => {
  try {
    return JSON.parse(string);
  } catch (e) {
    error: e;
  }
};

export const clone = o => parse(stringify(o));

export const extend = _.curry2((o, source) => {
  loop(source, (v, k) => (o[k] = v));
  return o;
});
