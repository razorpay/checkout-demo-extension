import { getSegmentOrCreate } from 'experiments';

export const EXPERIMENT_NAME = 'highlight_upi_intent_instruments_on_desktop';

/**
 * Checks in the localstorage if `highlight_upi_intent_instruments_on_desktop` experiment is enabled
 * @returns {Boolean} true or false
 */
export function isHighlightUpiIntentInstrumentExperimentEnabled() {
  return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}

export const HIGHLIGHT_UPI_INTENT_INSTRUMENTS_ON_DESKTOP = {
  name: EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};
