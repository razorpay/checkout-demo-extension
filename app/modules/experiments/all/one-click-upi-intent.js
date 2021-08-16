import { getSegmentOrCreate } from 'experiments';

export const EXPERIMENT_NAME = 'one_click_upi_intent';

/**
 * Checks in the localstorage if `one_click_upi_intent` experiment is enabled
 * @returns {Boolean} true or false
 */
export function oneClickUPIIntentExperiment() {
  return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}

export const ONE_CLICK_UPI_INTENT_EXPERIMENT = {
  name: EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.25 ? 0 : 1),
};
