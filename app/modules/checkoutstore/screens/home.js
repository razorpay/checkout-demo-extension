import { writable } from 'svelte/store';

export const contact = writable('');
export const email = writable('');
export const selectedInstrumentId = writable(null);

export const address = writable('');
export const pincode = writable('');
export const state = writable('');

export const multiTpvOption = writable('netbanking');
export const partialPaymentOption = writable();
export const partialPaymentAmount = writable('');

/**
 * Toggle visibility of contact details in the topbar
 * depending on the presence of contact number.
 */
contact.subscribe(value => {
  const topbar = _Doc.querySelector('#topbar #top-right');

  if (topbar) {
    _El.keepClass(topbar, 'hidden', !value);
  }
});
