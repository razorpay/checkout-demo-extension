import { createExperiment } from 'experiments';

/**
 * Experiment: One Click UPI Intent
 * [Disabled]
 */
const oneClickUPIIntent = createExperiment('one_click_upi_intent', 1, {
  overrideFn: () => false,
});

/**
 * Experiment: highlight UPI Intent On Desktop
 * Temporary full rollout
 */
const highlightUPIIntentOnDesktop = createExperiment(
  'highlight_upi_intent_instruments_on_desktop_v2',
  0
);

/**
 * Experiment: UPI NR L0 L1 Improvements
 * Temporary 0.50 rollout, argument must be 1-0.5
 */
export const upiNrL0L1Improvements = createExperiment(
  'upi_nr_l0_l1_improvements_50',
  0.5
);

export { highlightUPIIntentOnDesktop, oneClickUPIIntent };
