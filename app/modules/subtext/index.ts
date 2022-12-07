import { generateSubtextForCardInstrument } from './card';
import { generateSubtextForWalletInstrument } from './wallet';
import { generateSubtextForNetbankingInstrument } from './netbanking';
import { generateSubtextForEmandateInstrument } from './emandate';
import type { SubTextInstrument } from './type';
import type { LOCALES } from 'i18n/init';

const INSTRUMENT_SUBTEXT = {
  card: generateSubtextForCardInstrument,
  emi: generateSubtextForCardInstrument,
  netbanking: generateSubtextForNetbankingInstrument,
  wallet: generateSubtextForWalletInstrument,
  emandate: generateSubtextForEmandateInstrument,
} as const;

/**
 * Generates subtext for an instrument
 * @param {SubTextInstrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function getSubtextForInstrument(
  instrument: SubTextInstrument,
  locale: keyof typeof LOCALES
) {
  const method = instrument.method as keyof typeof INSTRUMENT_SUBTEXT;
  if (INSTRUMENT_SUBTEXT[method]) {
    const subTextFunction = INSTRUMENT_SUBTEXT[method] as (
      instrument: SubTextInstrument,
      local: string
    ) => string;
    return subTextFunction(instrument, locale);
  }
}
