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

/**
 * Assigns a store at at the provided key in the parent store.
 * Also updates the parent store every time the child is updated.
 * @param {Store} parent Parent store on which child should be set.
 * @param {Store} store Child store.
 * @param {String} name Key on which child store should be set.
 *
 * @return {Store} parent
 */
function assignSubstore(parent, store, name) {
  store.on('state', ({ current }) => {
    Store.prototype.set.call(parent, {
      [name]: current,
    });
  });

  Store.prototype.set.call(parent, {
    [name]: store.get(),
  });

  return parent;
}

/**
 * Creates a new store composed of all the provided stores.
 * @param {Object} stores key-value pair of stores.
 *
 * @return {Store}
 */
export function composeStore(stores) {
  const parent = createStore();

  _Obj.loop(stores, (store, name) => {
    assignSubstore(parent, store, name);
  });

  parent.set = undefined;

  return parent;
}
