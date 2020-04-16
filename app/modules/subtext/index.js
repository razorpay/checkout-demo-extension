import { generateCardSubtext } from './card';

const INSTRuMENT_SUBTEXT = {
  card: generateCardSubtext,
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
