// Svelte store for address
import { writable, derived } from 'svelte/store';

export const savedAddresses = writable([]);

export const isBillingSameAsShipping = writable(true);

export const consentViewCount = writable(0);

export const showBanner = derived(
  [consentViewCount],
  ([$consentViewCount]) => $consentViewCount === 1 || $consentViewCount === 2
);

export const consentGiven = writable(false);

export const addressScrollable = writable(false);
