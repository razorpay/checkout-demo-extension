import { get } from 'svelte/store';
import { contact, email } from 'checkoutstore/screens/home';

export function getDefaultCustomerDetails() {
  const details = {};

  if (get(email)) {
    details.email = get(email);
  }

  if (get(contact)) {
    details.contact = get(contact);
  }

  return details;
}
