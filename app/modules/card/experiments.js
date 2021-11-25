import { createExperiment } from 'experiments';

/**
 * Experiment: Card Separation
 * Runs for 3:1 of users to ask otp from add card screen on users click
 */
const delayOTP = createExperiment('delay_login_otp', 0.25);

/**
 * Experiment: Card Separation
 * Runs for 50% of users to show card as debit or credit
 */
const cardsSeparation = createExperiment('cards_separation', 1, {
  overrideFn: () => false,
}); // disabled

export { cardsSeparation, delayOTP };
