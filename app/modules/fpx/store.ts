import { hiddenInstruments } from 'checkoutstore/screens/home';
import { writable, derived } from 'svelte/store';
import type { Instrument } from 'types';

/**
 * active selected FPX bank
 */
export const selectedFPXBank = writable('');

/**
 * hidden FPX bank list from config
 */
export const hiddenFPXBanksUsingConfig = derived(
  hiddenInstruments,
  (instruments: Instrument[]) =>
    instruments
      .filter((instrument) => instrument.method === 'fpx')
      .map((instrument) => instrument.bank)
      .filter(Boolean)
);
