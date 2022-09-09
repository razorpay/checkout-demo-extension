import { writable } from 'svelte/store';

export const loadingState = writable(false);
export const contentStore = writable('');
export const subContentStore = writable('');
export const errorMessageCTA = writable(''); // CTA when loading is true
export const loadedCTA = writable('Retry'); // CTA when loading is false
export const secondaryLoadedCTA = writable(''); // secondary CTA (AFAIK use in paypal retry)
