/** misc */

/**
 * Customer related
 */

import { isOneClickCheckout } from './1cc';
import { getMerchantOption, getOption, getPreferences } from './base';
import { hasFeature } from './preferences';

export function shouldStoreCustomerInStorage() {
  const isLocalCustomer =
    !!getMerchantOption('customer_id') || !getPreferences('global');
  const rememberCustomer = isOneClickCheckout()
    ? getOption('remember_customer')
    : getMerchantOption('remember_customer');

  return !isLocalCustomer && rememberCustomer;
}

export function isAddressEnabled() {
  return hasFeature('customer_address', false);
}

/**
 * CRED wants put ads in instrument subtext.
 *
 * @param code
 * @returns {*}
 */
export function getCustomSubtextForMethod(code: string) {
  if (code === 'cred') {
    return getPreferences('methods.app_meta.cred.offer.description', null);
  }
  const customText = getPreferences('methods.custom_text');
  if (customText && customText[code]) {
    return customText[code];
  }
}

export function isBlockedDeactivated() {
  const preferences = getPreferences();
  if (
    !preferences?.hasOwnProperty('blocked') ||
    !preferences?.hasOwnProperty('activated')
  ) {
    return false;
  }
  return preferences.blocked || !preferences.activated;
}

export function isHDFCVASMerchant() {
  return hasFeature('hdfc_checkout_2', false);
}