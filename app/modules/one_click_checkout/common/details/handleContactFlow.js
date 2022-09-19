import { contact } from 'checkoutstore/screens/home';
import { customer } from 'checkoutstore/customer';
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { views } from 'one_click_checkout/routing/constants';
import { get } from 'svelte/store';
import { getCustomerByContact } from 'one_click_checkout/common/helpers/customer';
import { navigator } from 'one_click_checkout/routing/helpers/routing';

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
    /**
     * we are not relying on the reactive blocks in home/index.svelte as
     * the user gets logged out on every contact detail input change there.
     * Hence, we have to set the $customer store ourselves, if the contact has changed,
     * to trigger the reactive blocks in home/index.svelte that set the method blocks
     * based on customer details.
     */
    prevCustomer.logout(false, () => customer.set(getCustomerByContact(get(contact))));
  }
  return true;
};
