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
  'highlight_upi_intent_instruments_on_desktop',
  0
);

export { highlightUPIIntentOnDesktop, oneClickUPIIntent };
