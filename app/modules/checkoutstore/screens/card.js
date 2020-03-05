import { derived, writable } from 'svelte/store';
import { getCardType } from 'common/card';

export const cardNumber = writable('');
export const cardCvv = writable('');
export const cardExpiry = writable('');
export const cardName = writable('');
export const remember = writable(true);
export const authType = writable('c3ds');

export const cardType = derived(cardNumber, getCardType);
