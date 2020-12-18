import { generateSubtextForCardInstrument } from './card';
import { generateSubtextForWalletInstrument } from './wallet';
import { generateSubtextForNetbankingInstrument } from './netbanking';

const INSTRUMENT_SUBTEXT = {
  card: generateSubtextForCardInstrument,
  emi: generateSubtextForCardInstrument,
  netbanking: generateSubtextForNetbankingInstrument,
  wallet: generateSubtextForWalletInstrument,
};

/**
 * Generates subtext for an instrument
 * @param {Instrument} instrument
 * @param {string} locale
 *
 * @returns {string}
 */
export function getSubtextForInstrument(instrument, locale) {
  if (INSTRUMENT_SUBTEXT[instrument.method]) {
    return INSTRUMENT_SUBTEXT[instrument.method](instrument, locale);
  }
}
