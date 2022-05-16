import { getPreferences } from './base';
import { isPartialPayment } from './preferences';

/**
 * Offers related helper function
 */
export const getMerchantOffers = () => {
  // Ignore all offers ( including forced offers ) in case of partial payments.
  if (isPartialPayment()) {
    return [];
  }
  // Temporary fix: If customer-feebearer do not show any offers to the user.
  if (getPreferences('fee_bearer') && getPreferences('force_offer')) {
    return getPreferences('offers');
  } else if (getPreferences('fee_bearer')) {
    return [];
  } else {
    return getPreferences('offers');
  }
};
export const isOfferForced = () => getPreferences('force_offer');

export const getCheckoutConfig = () => getPreferences('checkout_config');
export const getOrgDetails = () => getPreferences('org');
