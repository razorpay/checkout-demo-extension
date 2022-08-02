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
 * Temporary full rollout, argument must be 0
 */
export const upiNrL0L1Improvements = createExperiment(
  'upi_nr_l0_l1_improvements_100',
  0
);

/**
 * Experiment: UPI QR On L1 Feature
 * Temporary 5% rollout, argument must be 1-0.05=>0.95
 */
const upiQrOnL1 = createExperiment('upi_qr_on_l1_percentage_5', 0.95);

/**
 * Experiment: UPI QR On L0 Feature
 * Temporary 5% rollout, argument must be 1-0.05=>0.95
 */
const upiQrOnL0 = createExperiment('upi_qr_on_l0_percentage_5', 0.95);

/**
 * Experiment: UPI UX v1.1
 * Temporary full rollout, argument must be 0
 */
const upiUxV1dot1 = createExperiment('upi_ux_v_1_dot_1_percentage_100', 0);

export {
  highlightUPIIntentOnDesktop,
  oneClickUPIIntent,
  upiQrOnL1,
  upiQrOnL0,
  upiUxV1dot1,
};
