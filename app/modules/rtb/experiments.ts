import { createExperiment } from 'experiments';

/**
 * Experiment: Show RTB Bottom Sheet On-Click of RTB badge
 * Enabled for 100% of users. To be removed post monitoring.
 *
 * ToDo - Make the API more user-friendly as the current way of passing the (1-exp_value) is misleading
 */
const showRTBBottomSheet = createExperiment(
  'show_rtb_bottom_sheet_rampup_full',
  0
);
export { showRTBBottomSheet };
