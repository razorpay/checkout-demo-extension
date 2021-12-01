import { writable, derived } from 'svelte/store';
import RazorpayStore, { getOption } from 'razorpay';
import { hiddenInstruments } from './home';

RazorpayStore.subscribe((r) => {
  r && selectedBank.set(getOption('prefill.bank'));
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
