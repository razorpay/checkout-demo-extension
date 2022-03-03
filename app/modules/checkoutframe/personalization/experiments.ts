import { createExperiment } from 'experiments';

/**
 * Experiment: Only show UPI and Saved Card instruments in preferred methods
 */
const upiAndCardOnlyPreferredMethods = createExperiment(
  'upi_and_card_only_preferred_methods',
  0.5
);

export { upiAndCardOnlyPreferredMethods };
