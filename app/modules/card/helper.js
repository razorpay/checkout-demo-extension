import { isGlobalVault, shouldRememberCustomer } from 'checkoutstore/index.js';
import { AVSBillingAddress, AVSScreenMap } from 'checkoutstore/screens/card';
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

export const resetAVSBillingAddressData = () => {
  AVSBillingAddress.set(null);
};

export const updateAVSScreenMap = (key, value) => {
  AVSScreenMap.update((prevValue) => ({
    ...prevValue,
    [key]: value,
  }));
};
