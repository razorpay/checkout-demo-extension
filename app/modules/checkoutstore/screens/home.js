import { readable, writable } from 'svelte/store';

export const contact = writable('+');
export const email = writable('');
export const selectedInstrumentId = writable(null);

export const address = writable('');
export const pincode = writable('');
export const state = writable('');

export const multiTpvOption = writable('netbanking');
export const partialPaymentOption = writable();
export const partialPaymentAmount = writable('');

/**
 * A contact is said to be present if it has more than three characters,
 * the three characters usually being "+91".
 */
export const isContactPresent = readable(false, set => {
  contact.subscribe(value => {
    const isPresent = value && value !== '+91' && value !== '+';

    set(isPresent);
  });
});

/**
 * Toggle visibility of contact details in the topbar
 * depending on the presence of contact number.
 */
isContactPresent.subscribe(value => {
  const topbar = _Doc.querySelector('#topbar #top-right');

  if (topbar) {
    _El.keepClass(topbar, 'hidden', !value);
  }
});
