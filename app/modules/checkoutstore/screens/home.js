import { derived, writable } from 'svelte/store';

export const contact = writable('+');
export const email = writable('');

export const address = writable('');
export const pincode = writable('');
export const state = writable('');

export const multiTpvOption = writable('netbanking');
export const partialPaymentOption = writable();
export const partialPaymentAmount = writable('');

export const blocks = writable([]);
export const instruments = derived(blocks, allBlocks => {
  let allInstruments = [];

  _Arr.loop(allBlocks, block =>
    _Arr.mergeWith(allInstruments, block.instruments)
  );

  return allInstruments;
});

export const selectedInstrumentId = writable(null);
export const selectedInstrument = derived(
  [instruments, selectedInstrumentId],
  ([$instruments = [], $selectedInstrumentId = null]) =>
    _Arr.find(
      $instruments,
      instrument => instrument.id === $selectedInstrumentId
    )
);

/**
 * A contact is said to be present if it has more than three characters,
 * the three characters usually being "+91".
 */
export const isContactPresent = derived(
  contact,
  contactValue => contactValue && contactValue !== '+91' && contactValue !== '+'
);

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
