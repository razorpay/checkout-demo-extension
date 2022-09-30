import { getPreferences } from './base';

/**
 * Fee bearer
 */
export const isCustomerFeeBearer = () => getPreferences('fee_bearer');

export function getConvenienceFeeConfig() {
  return getPreferences('order.convenience_fee_config', null);
}

export function isDynamicFeeBearer() {
  return Boolean(getConvenienceFeeConfig());
}

export function getDynamicFeeBearerMerchantMessage() {
  return getPreferences('order.convenience_fee_config.checkout_message', '');
}
