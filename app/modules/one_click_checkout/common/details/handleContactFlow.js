import { contact } from 'checkoutstore/screens/home';
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { views } from 'one_click_checkout/routing/constants';
import { get } from 'svelte/store';
import { getCustomerByContact } from 'one_click_checkout/common/helpers/customer';

/**
 * Method to handle submission of new details by a logged in user
 * @param {number} prevContact the contact number of the user
 * @returns Boolean
 */
export const handleContactFlow = (prevContact) => {
  const prevCustomer = getCustomerByContact(prevContact);
  if (get(contact) === prevContact) {
    return false;
  }
  resetOrder(true);
  navigator.navigateTo({ path: views.DETAILS, initialize: true });
  if (prevCustomer?.logged) {
    prevCustomer.logout(false);
  }
  return true;
};
