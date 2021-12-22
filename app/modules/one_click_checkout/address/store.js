// Svelte store for address
import { writable } from 'svelte/store';

export const savedAddresses = writable([]);

export const isBillingSameAsShipping = writable(true);

export const didSaveAddress = writable(false);

export const availableStateList = writable({});

export const phoneObj = writable({});
