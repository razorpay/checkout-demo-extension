import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
import { getMerchantOption } from 'razorpay';
import type { Banks } from 'razorpay/types/Preferences';
import { getSession } from 'sessionmanager';

/**
 * check if a bank code is offline ( high downtimeSeverity )
 * @param {string} bankCode
 * @returns {boolean}
 */
export function checkOffline(bankCode: string) {
  const fpxDowntimes = getDowntimes().fpx;
  const currentDowntime = checkDowntime(fpxDowntimes, 'bank', bankCode);

  return currentDowntime === 'high';
}

/**
 * checks whether redirect flow is supported on FPX or not
 * @returns {boolean}
 */
export function checkRedirectForFpx() {
  return (
    getMerchantOption('redirect') || getMerchantOption('redirect') === null
  );
}

/**
 * handles CTA submit for FPX payment
 * @param {string} bank bank code for creating payment
 */
export function handleFpxPayment(bank: string) {
  const session = getSession();
  const payload = { ...session.getPayload(), method: 'fpx', bank };
  session.preSubmit(null, payload);
}

/**
 * checks if all banks are offline
 * @param {Partial<Banks>} banks list of banks
 * @returns {boolean}
 */
export function allBanksOffline(banks: Partial<Banks>): boolean {
  return Object.keys(banks)?.every((bank) => checkOffline(bank)) || false;
}
