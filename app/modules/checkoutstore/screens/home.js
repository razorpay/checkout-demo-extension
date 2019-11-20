import { writable } from 'svelte/store';

export const contact = writable('');
export const email = writable('');
export const selectedInstrumentId = writable(null);
