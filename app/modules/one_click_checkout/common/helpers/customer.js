import { getCustomer } from 'checkoutframe/customer';
import { contact } from 'checkoutstore/screens/home';
import { get } from 'svelte/store';

export function isUserLoggedIn() {
  const customer = getCustomerDetails();
  return customer.logged;
}

export function getCustomerDetails() {
  return getCustomer(get(contact), null, true);
}

export function getCustomerByContact(phone) {
  return getCustomer(phone, null, true);
}
