import { getOffersForTab } from 'checkoutframe/offers/index';
import { isCustomerFeeBearer } from 'checkoutstore/index.js';
import { oneClickUPIIntentExperiment } from 'experiments/all/one-click-upi-intent';

export function oneClickUPIIntent() {
  /**
   * disable experiment for fee bearer & UPI offer available
   */
  const offers = getOffersForTab('upi') || [];
  if (isCustomerFeeBearer() || offers.length > 0) {
    return false;
  }
  return oneClickUPIIntentExperiment();
}
