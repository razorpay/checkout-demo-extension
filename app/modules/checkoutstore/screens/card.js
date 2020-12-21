import { derived, writable } from 'svelte/store';
import { getIin, getCardType } from 'common/card';

export const cardNumber = writable('');
export const cardCvv = writable('');
export const cardExpiry = writable('');
export const cardName = writable('');
export const remember = writable(true);
export const authType = writable('c3ds');
export const selectedCard = writable(null);
export const selectedApp = writable(null);
export const dccCurrency = writable('');
export const currencyRequestId = writable('');

export const cardType = derived(cardNumber, getCardType);
export const cardIin = derived(cardNumber, getIin);
export const cardTab = writable(''); // Value of current tab. Values can be one of "card", "emi", "". "" can be considered to be null.

export const showNoCvvCheckbox = derived(
  [cardNumber, cardType],
  ([$cardNumber, $cardType]) =>
    $cardType === 'maestro' && $cardNumber.length > 5
);

export const noCvvChecked = writable(false);

export const internationalCurrencyCalloutNeeded = writable(false);
