const cache = {};

export function getCache(key) {
  if (cache[key]) {
    return cache[key];
  }
  return null;
}

export function setCache(key, value) {
  // Avoid updating cache if there are no coupons.
  if (!value.length) {
    return;
  }
  cache[key] = value;
}
