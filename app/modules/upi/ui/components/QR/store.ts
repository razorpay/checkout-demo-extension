/**
 * This store is not supposed to be used outside, hence created within component dir
 */

import { writable } from 'svelte/store';

interface QrStateType {
  /**
   * QR Component current state
   */
  status?: UPI.QRStatus;
  /**
   * QR Payment Intent URL to be used for image generation if any payment is running
   */
  url?: string;
  /**
   * Used to create new QR payment on component onMount
   */
  autoGenerate?: boolean;
  /**
   * This is to track how many payments are actually un-intended
   * count at cancellation:0  => Untended Payment
   * count at cancellation:>0 => User intentionally created payment but somehow cancel happened
   */
  manualRefresh?: boolean;
}

const initialState: QrStateType = {
  /**
   * Default must be refresh, as in any negative case, user lands and wants to generate new QR, refresh could help
   * And if user tried p13n V1 QR and cancels the payment, he will land back in UPI page, in this case we should
   * not create another another payment automatically rather give user manual chance if required
   */
  status: 'refresh',
  url: '',
  autoGenerate: true,
  manualRefresh: false,
};
export const qrState = writable<QrStateType>(initialState);

export function updateQrState(data: Partial<QrStateType>) {
  qrState.update((prevState: typeof data) => ({
    ...prevState,
    ...data,
  }));
}
export function resetQRState() {
  updateQrState({ ...initialState, autoGenerate: false });
}
