import { getSession } from 'sessionmanager';
import { selectedBank } from 'emiV2/store';
import { get, Writable } from 'svelte/store';
import { showDowntimeAlert } from 'checkoutframe/downtimes/utils';
import type { EMIBANKS } from 'emiV2/types';

export const initiateEmiFlow = (
  bank: EMIBANKS,
  setData: Writable<EMIBANKS>['set'],
  proceedForAction: () => void
) => {
  const session = getSession();
  /** If it's a card payment we need to check these things before we trigger payment
   * Check for downtimes
   * If downtimes are present store the function in bank store and trigger the alert flow
   */
  if (session.screen === 'card') {
    const downtimeSevere = bank.downtimeConfig && bank.downtimeConfig.severe;
    /**
     * No Downtime? Proceed,
     * Else update the callback and trigger downtime
     */
    if (!downtimeSevere) {
      proceedForAction();
    } else {
      bank.callbackOnPay = proceedForAction;
      setData(bank);
      showDowntimeAlert(bank.code);
    }
  }
};

export function avoidSubmitViaSession(): boolean {
  const selectedEmiBank = get(selectedBank);
  if (typeof selectedEmiBank?.callbackOnPay === 'function') {
    selectedEmiBank.callbackOnPay();
    return true;
  }
  return false;
}

export const resetCallbackOnEmiPayViaBank = () => {
  const selectedEmiBank = get(selectedBank);
  if (selectedEmiBank?.callbackOnPay) {
    selectedBank.set({
      ...selectedEmiBank,
      callbackOnPay: undefined,
    });
  }
};
