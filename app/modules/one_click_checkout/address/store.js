// Svelte store for address
import { writable } from 'svelte/store';

export const savedAddresses = writable([]);

export const isBillingSameAsShipping = writable(true);
