const cache = {};

export function getCache(key) {
  if (cache[key]) {
    return cache[key];
  }
  return null;
}

export function setCache(key, value) {
  cache[key] = value;
}
