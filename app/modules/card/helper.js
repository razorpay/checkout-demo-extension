import { isGlobalVault, shouldRememberCustomer } from 'checkoutstore/index.js';
import { delayLoginOTP } from 'experiments/all/delay-login-otp';

export function delayLoginOTPExperiment() {
  /**
   * check for global vault enabled
   */
  if (!isGlobalVault() || !shouldRememberCustomer()) {
    return false;
  }

  return delayLoginOTP();
}
