import { createExperiment } from 'experiments';

/**
 * Experiment: Card Separation
 * [disabled]
 */
const delayOTP = createExperiment('delay_login_otp', 1, {
  overrideFn: () => false,
});

/**
 * Experiment: Card Separation
 * [disabled]
 */
const cardsSeparation = createExperiment('cards_separation', 1, {
  overrideFn: () => false,
}); // disabled

export { cardsSeparation, delayOTP };
