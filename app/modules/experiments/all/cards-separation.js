export const EXPERIMENT_NAME = 'cards_separation';

/**
 * Checks in the localstorage if `cards_separation` experiment is enabled
 * @returns {Boolean} true or false
 */
export function isCardsSeparationExperimentEnabled() {
  return false;
}

export const CARDS_SEPARATION_EXPERIMENT = {
  name: EXPERIMENT_NAME,
  evaluator: () => (Math.random() < 0.5 ? 0 : 1),
};
