import { writable, derived } from 'svelte/store';
import RazorpayStore, { getOption } from 'razorpay';
import { hiddenInstruments } from './home';
import { getPrefillBank } from 'netbanking/helper';

RazorpayStore.subscribe((r) => {
  r && selectedBank.set(getPrefillBank());
});

export const selectedBank = writable('');

export const hiddenBanksUsingConfig = derived(
  hiddenInstruments,
  (instruments) =>
    instruments
      .filter((instrument) => instrument.method === 'netbanking')
      .map((instrument) => instrument.bank)
      .filter(Boolean)
);
