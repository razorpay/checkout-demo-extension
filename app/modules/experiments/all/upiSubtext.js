import { getSegmentOrCreate } from 'experiments';

export const EXPERIMENT_NAME = 'upi_subtext';

/**
 * Checks in the localstorage if `upi_subtext` experiment is enabled
 * @returns {Boolean} true or false
 */
export function isUpiSubtextExperimentEnabled() {
    return getSegmentOrCreate(EXPERIMENT_NAME) === 1;
}