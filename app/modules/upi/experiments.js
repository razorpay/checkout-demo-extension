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
 * Runs for 50% of users to show upi intent app in desktop which basically redirect user to collect screen prefill vpa
 */
const highlightUPIIntentOnDesktop = createExperiment(
  'highlight_upi_intent_instruments_on_desktop',
  0.5
);

export { highlightUPIIntentOnDesktop, oneClickUPIIntent };
