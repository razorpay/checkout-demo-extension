import { createExperiment } from 'experiments';

/**
 * Experiment: One Click UPI Intent
 * [Disabled]
 */
const oneClickUPIIntent = createExperiment('one_click_upi_intent', 1, {
  overrideFn: () => false,
});

export { oneClickUPIIntent };
