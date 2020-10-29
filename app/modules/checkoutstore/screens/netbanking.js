import { writable, derived } from 'svelte/store';
import { getOption, razorpayInstanceStore } from 'checkoutstore';
import { hiddenInstruments } from './home';

razorpayInstanceStore.subscribe(r => {
  r && selectedBank.set(getOption('prefill.bank'));
});

export const selectedBank = writable('');

export const hiddenBanksUsingConfig = derived(hiddenInstruments, instruments =>
  instruments
    .filter(instrument => instrument.method === 'netbanking')
    .map(instrument => instrument.bank)
    .filter(Boolean)
);
