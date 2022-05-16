/** misc */

/**
 * Customer related
 */

import { getMerchantOption, getPreferences } from './base';
import { hasFeature } from './preferences';

export function shouldStoreCustomerInStorage() {
  const globalCustomer = getPreferences('global');
  const rememberCustomer = getMerchantOption('remember_customer');

  return globalCustomer && rememberCustomer;
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
export function getCustomSubtextForMethod(code) {
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
    !preferences.hasOwnProperty('blocked') ||
    !preferences.hasOwnProperty('activated')
  ) {
    return false;
  }
  return preferences.blocked || !preferences.activated;
}

export function isHDFCVASMerchant() {
  return hasFeature('hdfc_checkout_2', false);
}
