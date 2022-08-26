// Svelte store for address
import { writable, get } from 'svelte/store';
import { contact, email } from 'checkoutstore/screens/home';
import { getOption, getPreferences, isOneClickCheckout } from 'razorpay';

export const isEditContactFlow = writable(false);

/**
 * @returns boolean
 * Checks if 1CC enabled and show_address is true
 */
export const shouldShowAddress = () =>
  isOneClickCheckout() && getOption('show_address');

/**
 * @returns boolean
 * Checks if 1CC enabled and show_coupons is true and should not be payment link or payment page
 */
export const shouldShowCoupons = () =>
  isOneClickCheckout() &&
  getOption('show_coupons') &&
  !getOption('payment_link_id');

/**
 * @returns boolean
 * Checks for force_cod option
 */
export const isCodForced = () => getOption('force_cod');

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

export const isAutopopulateDisabled = () =>
  getPreferences('1cc_city_autopopulate_disable');

export const getCartExperiment = () => getPreferences('1cc_cart_items_exp');
