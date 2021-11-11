import { getOffersForTab } from 'checkoutframe/offers/index';
import { isCustomerFeeBearer } from 'checkoutstore/index.js';
import { oneClickUPIIntent as oneClickUPIIntentExperiment } from 'upi/experiments';

export function oneClickUPIIntent() {
  /**
   * disable experiment for fee bearer & UPI offer available
   */
  const offers = getOffersForTab('upi') || [];
  if (isCustomerFeeBearer() || offers.length > 0) {
    return false;
  }
  return oneClickUPIIntentExperiment.enabled();
}
