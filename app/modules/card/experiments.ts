import { createExperiment, CreateExperimentOptions } from 'experiments';

/**
 * Experiment: Card Separation
 * [disabled]
 */
const delayOTP = createExperiment('delay_login_otp', 1, {
  overrideFn: () => false,
} as CreateExperimentOptions);

/**
 * Experiment: Card Separation
 * [disabled]
 */
const cardsSeparation = createExperiment('cards_separation', 1, {
  overrideFn: () => false,
} as CreateExperimentOptions); // disabled

export { cardsSeparation, delayOTP };
