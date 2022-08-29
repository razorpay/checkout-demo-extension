import { parse } from 'utils/object';

const PREFERRED_INSTRUMENTS = 'rzp_preffered_instruments';

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
export function hashFnv32a(str = '', asString = true, seed = 0xdeadc0de) {
  let i,
    l,
    hval = seed;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  if (asString) {
    // Convert to 8 digit hex string
    return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
  }
  return hval >>> 0;
}

/**
 * Set in p13n storage
 * @param {Object} data
 */
export function set(data) {
  try {
    global.localStorage.setItem(PREFERRED_INSTRUMENTS, JSON.stringify(data));
  } catch (e) {}
}

/**
 * Returns blob from p13n storage
 *
 * @returns {Object}
 */
function get() {
  let data;

  try {
    data = parse(global.localStorage.getItem(PREFERRED_INSTRUMENTS));

    if (_.isArray(data)) {
      data = {};
    }
  } catch (e) {}

  if (_.isNonNullObject(data)) {
    return data;
  }

  return {};
}

/**
 * Returns a list of all instruments in storage.
 *
 * @returns {Object}
 */
export function getAllInstruments() {
  // Get instruments for all customers
  return get();
}
