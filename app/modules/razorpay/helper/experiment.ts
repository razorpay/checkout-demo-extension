import { getPreferences } from './base';
import { isRedesignV15 } from './redesign';

export function reusePaymentIdExperimentEnabled() {
  return (
    (getPreferences('experiments.reuse_upi_paymentId') as boolean) &&
    isRedesignV15()
  );
}
