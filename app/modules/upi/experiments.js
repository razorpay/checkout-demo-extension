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
 * Runs for 20% of users
 * Note: 0.80 as evaluator means it will be disabled for 80% of cases and will be enabled for 20% only.
 */
const otherUPIIntentApps = createExperiment('other_intent_apps_20', 0.8);

export { highlightUPIIntentOnDesktop, oneClickUPIIntent, otherUPIIntentApps };
