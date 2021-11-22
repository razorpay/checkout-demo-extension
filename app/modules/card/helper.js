import { isGlobalVault, shouldRememberCustomer } from 'checkoutstore/index.js';
import { delayOTP } from 'card/experiments';

export function delayLoginOTPExperiment() {
  /**
   * check for global vault enabled
   */
  if (!isGlobalVault() || !shouldRememberCustomer()) {
    return false;
  }
  return delayOTP.enabled();
}
