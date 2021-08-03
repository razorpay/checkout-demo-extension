import { getSegmentOrCreate } from 'experiments';

export const EXPERIMENT_NAME = 'highlight_upi_intent_instruments_on_desktop';

/**
 * Checks in the localstorage if `highlight_upi_intent_instruments_on_desktop` experiment is enabled
 * @returns {Boolean} true or false
 */
export function isHighlightUpiIntentInstrumentExperimentEnabled() {
  return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}
