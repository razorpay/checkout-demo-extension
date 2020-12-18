import { generateSubtextForCardInstrument } from './card';
import { generateSubtextForWalletInstrument } from './wallet';
import { generateSubtextForNetbankingInstrument } from './netbanking';

const INSTRuMENT_SUBTEXT = {
  card: generateSubtextForCardInstrument,
  emi: generateSubtextForCardInstrument,
  netbanking: generateSubtextForNetbankingInstrument,
  wallet: generateSubtextForWalletInstrument,
};

/**
 * Generates subtext for an instrument
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
export function getSubtextForInstrument(instrument) {
  if (INSTRuMENT_SUBTEXT[instrument.method]) {
    return INSTRuMENT_SUBTEXT[instrument.method](instrument);
  }
}
