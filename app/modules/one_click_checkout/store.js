// Svelte store for address
import { writable, get } from 'svelte/store';
import { contact, email } from 'checkoutstore/screens/home';
import { isOneClickCheckout } from 'checkoutstore';
import { getOption } from 'checkoutstore';

export const isEditContactFlow = writable(false);

export const isLogoutFlow = writable(false);
/**
 * @returns boolean
 * Checks if 1CC enabled and show_address is true
 */
export const shouldShowAddress = () =>
  isOneClickCheckout() && getOption('show_address');

/**
 * @returns boolean
 * Checks if 1CC enabled and show_coupons is true
 */
export const shouldShowCoupons = () =>
  isOneClickCheckout() && getOption('show_coupons');

/**
 * @returns boolean
 * Checks for force_cod option
 */
export const isCodForced = () => getOption('force_cod');

/**
 * @returns boolean
 * Checks for mandatory_login option
 */
export const isLoginMandatory = () => {
  return getOption('mandatory_login');
};

export function getContactPayload() {
  const payload = {};
  if (get(email)) {
    payload['email'] = get(email);
  }
  if (get(contact)) {
    payload['contact'] = get(contact);
  }

  return payload;
}
