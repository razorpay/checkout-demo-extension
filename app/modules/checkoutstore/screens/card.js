import { writable } from 'svelte/store';

export const cardNumber = writable('');
export const cardCvv = writable('');
export const cardExpiry = writable('');
export const cardName = writable('');
