import { getSegmentOrCreate } from 'experiments';

export const EXPERIMENT_NAME = 'cards_separation';

/**
 * Checks in the localstorage if `cards_separation` experiment is enabled
 * @returns {Boolean} true or false
 */
export function isCardsSeparationExperimentEnabled() {
  return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}
