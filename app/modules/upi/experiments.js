import { createExperiment } from 'experiments';

/**
 * Experiment: One Click UPI Intent
 * Runs for 3:1 of users can trigger intent app directly without clicking on CTA
 */
const oneClickUPIIntent = createExperiment('one_click_upi_intent', 1); // disabled

/**
 * Experiment: highlight UPI Intent On Desktop
 * Runs for 50% of users to show upi intent app in desktop which basically redirect user to collect screen prefill vpa
 */
const highlightUPIIntentOnDesktop = createExperiment(
  'highlight_upi_intent_instruments_on_desktop',
  0.5
);

/**
 * Experiment: Other UPI Apps for Intent on Mobile web
 * Runs for 5% of users
 * Note: 0.95 as evaluator means it will be disabled for 95% of cases and will be enabled for 5% only.
 */
const otherUPIIntentApps = createExperiment('other_intent_apps', 0.95);

export { highlightUPIIntentOnDesktop, oneClickUPIIntent, otherUPIIntentApps };
