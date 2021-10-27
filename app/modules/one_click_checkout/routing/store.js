import { writable } from 'svelte/store';

export const currentView = writable('');

export const history = writable([]);

export const resetRouting = () => {
  currentView.set('');
  history.set([]);
};
