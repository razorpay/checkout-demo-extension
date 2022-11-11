import fs from 'fs/promises';
const { createHash } = await import('node:crypto');

export const md5 = (data) => createHash('md5').update(data).digest('hex');

export const JsonResponse = (o) => ({
  status: 200,
  body: JSON.stringify(o),
  headers: {
    'content-type': 'application/json',
  },
});

export const JsonpResponse = (o) => ({
  status: 200,
  body: o,
  headers: {
    'content-type': 'text/javascript',
  },
});

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function promisePair() {
  let resolver;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  return [promise, resolver];
}

export function isSerializable(val, visited = new WeakSet()) {
  const type = typeof val;
  const isObject = type === 'object';

  if (isObject) {
    if (val === null) {
      return true;
    }

    const proto = Object.getPrototypeOf(val);

    // Object.create(null)
    if (proto === null) {
      return true;
    }

    // check if basic object, (not a class or an inheriting object)
    if (proto.constructor !== Object && proto.constructor !== Array) {
      return false;
    }

    if (visited.has(val)) {
      // circular object, if same value is encountered again
      // works since objects are kept as reference
      return false;
    }
    visited.add(val); // remember this object to use in circular check next time
  } else {
    if (
      type !== 'boolean' &&
      type !== 'string' &&
      !(type === 'number' && Number.isFinite(val))
    ) {
      return false;
    }
  }

  // for objects, loop and verify that all props are serializable as well
  if (isObject) {
    // works for both arrays and objects
    for (let property in val) {
      if (val.hasOwnProperty(property)) {
        if (!isSerializable(val[property], visited)) {
          return false;
        }
      }
    }
  }
  return true;
}
