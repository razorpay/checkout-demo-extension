import type { Writable } from 'svelte/store';
import { showDowntimeAlert } from 'checkoutframe/downtimes/utils';

/**
 * This method aim is to see if downtime has to be handled
 * Update the store
 * Trigger the payment flow
 */
export const initiateNecessaryFlow = (
  data: UPI.UpiAppForPay,
  setData: Writable<UPI.UpiAppForPay>['set'],
  proceedForAction: (...args: any[]) => void
) => {
  const downtimeSevere = data.downtimeConfig && data.downtimeConfig.severe;
  const { app_name, name } = (data.app || {}) as UPI.AppConfiguration;
  /**
   * No Downtime? Proceed,
   * Else update the callback and trigger downtime
   */
  if (!downtimeSevere) {
    setData(data);
    proceedForAction();
  } else {
    data.callbackOnPay = proceedForAction;
    /**
     * DO NOT alter the sequence here
     * 1. set the store data
     * 2. trigger downtime alert for high
     * why? alert depends on the store data
     */
    setData(data);
    if (downtimeSevere === 'high') {
      showDowntimeAlert(name || app_name);
    }
  }
};
