import { Store } from 'svelte/store.js';

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
export function assignSubstore(parent, store, name) {
  store.on('state', ({ current }) => {
    parent.set({
      [name]: current,
    });
  });

  parent.set({
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

  return parent;
}
