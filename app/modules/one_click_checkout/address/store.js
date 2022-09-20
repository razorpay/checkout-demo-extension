// Svelte store for address
import { writable, derived, get } from 'svelte/store';

export const savedAddresses = writable([]);

export const isBillingSameAsShipping = writable(true);

export const consentViewCount = writable(0);

export const showBanner = derived(
  [consentViewCount],
  ([$consentViewCount]) => $consentViewCount === 1 || $consentViewCount === 2
);

export const consentGiven = writable(false);

export const prefilledName = derived(
  savedAddresses,
  ($savedAddresses) => $savedAddresses?.[0]?.name
);

export const getSavedAddresses = () => get(savedAddresses);
