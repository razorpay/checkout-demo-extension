import { derived, writable } from 'svelte/store';

export const isContactValid = writable(false);

export const isEmailValid = writable(false);

export const isContactAndEmailValid = derived(
  [isEmailValid, isContactValid],
  ([$isEmailValid, $isContactValid]) => $isEmailValid && $isContactValid
);
