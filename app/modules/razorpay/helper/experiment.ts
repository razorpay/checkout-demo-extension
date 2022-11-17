import { getPreferences } from './base';
import { isRedesignV15 } from './redesign';

export function reusePaymentIdExperimentEnabled() {
  return (
    (getPreferences('experiments.reuse_upi_paymentId') as boolean) &&
    isRedesignV15()
  );
}

export function isRemoveDefaultTokenizationSupported() {
  return !!getPreferences(
    'experiments.remove_default_tokenization_flag'
  ) ;
}
