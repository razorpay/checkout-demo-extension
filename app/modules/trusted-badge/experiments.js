import { createExperiment } from 'experiments';

/**
 * Experiment: Hide RTB Highlights Info shown On-Click of RTB badge
 * Enabled for 100% of users. To be removed post monitoring.
 *
 * ToDo - Make the API more user-friendly as the current way of passing the (1-exp_value) is misleading
 */
const hideRTBHighlightsExperiment = createExperiment(
  'hide_rtb_highlights',
  0.0
);

export { hideRTBHighlightsExperiment };
