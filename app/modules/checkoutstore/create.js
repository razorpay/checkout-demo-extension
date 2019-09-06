import { Store as SvelteStore } from 'svelte/store.js';

export function Store(state, options) {
  SvelteStore.call(this, state, options);
}

Store.prototype = Object.create(SvelteStore.prototype);

/**
 * Allows updating the store by passing a function
 * that manipulates the data.
 * Inspired by immer.
 *
 * @param {Function} fn
 *
 * @return {Boolean} Whether or not the store was set.
 */
Store.prototype.update = function update(fn) {
  const state = _Obj.clone(this.get());
  const modified = fn(state);

  if (modified) {
    Store.prototype.set.call(this, state);

    return true;
  }

  return false;
};

/**
 * Creates a store.
 * @param {Object} state
 * @param {Object} options
 *
 * @return {Store}
 */
export function createStore(state, options) {
  return new Store(state, options);
}
