/**
 * file created to remove circular deps
 */

import { getPreferences, isPartialPayment } from 'razorpay';

let anyV2APIAttemptFailed = false;

export function updateV2FailureState(state: boolean) {
  anyV2APIAttemptFailed = state;
}

export function autoGenerateQREnabled(): boolean {
  const isExperimentEnable = getPreferences('experiments.upi_qr_v2') as boolean;
  /** 
     * Most of the flows already handled in app/modules/upi/features.ts (initUpiQrV2)
     * const status =
        isUPIFlowEnabled('qr') &&
        !isCustomerFeeBearer() &&
        !isDynamicFeeBearer() &&
        !isInternational() &&
        !upiHighDowntime &&
        !top3AppsDown;
     * we hide the QR L0/L1 feature in those case
    */
  // adding partial payment flow
  const isFlowEnabled = !isPartialPayment();
  return isExperimentEnable && isFlowEnabled && !anyV2APIAttemptFailed;
}
