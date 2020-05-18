import { derived, writable } from 'svelte/store';

export const contact = writable('+');
export const email = writable('');
export const emiContact = writable('');

export const address = writable('');
export const pincode = writable('');
export const state = writable('');

export const multiTpvOption = writable('netbanking');
export const partialPaymentOption = writable();
export const partialPaymentAmount = writable('');

export const blocks = writable([]);
export const instruments = derived(blocks, allBlocks => {
  const allInstruments = _Arr.flatMap(allBlocks, block => block.instruments);

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
 * Stores the instrument for which method is opened
 */
export const methodTabInstrument = writable(null);

/**
 * A contact is said to be present if it has more than three characters,
 * the three characters usually being "+91".
 */
export const isContactPresent = derived(
  contact,
  contactValue => contactValue && contactValue !== '+91' && contactValue !== '+'
);
