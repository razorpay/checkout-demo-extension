import { get } from 'svelte/store';
import { getCustomer, isEmailReadOnly } from 'checkoutframe/customer';
import { setEmail, setContact, contact } from 'checkoutstore/screens/home';
import { isEmailHidden } from 'razorpay';

import type { UserVerifySuccessApiResponse } from './types';

// analytics imports
import Analytics from 'analytics';
import { META_KEYS } from './analytics/events';

export function setCustomer(
  customerData: Readonly<UserVerifySuccessApiResponse>
) {
  if (customerData.status !== 'resolved' || !customerData.contact) {
    return;
  }

  if (customerData.email && !isEmailHidden() && !isEmailReadOnly()) {
    setEmail(customerData.email);
  }

  setContact(customerData.contact);

  if (customerData.contact.startsWith('+91')) {
    const customer = getCustomer(get(contact), null, true);
    customer.mark_logged(customerData);
  }
  Analytics.setMeta(META_KEYS.LOGIN_SOURCE, 'truecaller');
  Analytics.setMeta(META_KEYS.LOGIN_METHOD, 'default');
}
