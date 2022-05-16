import { findCountryCode } from 'common/countrycodes';
import * as ContactStorage from 'checkoutframe/contact-storage';
import {
  getOption,
  getPreferences,
  shouldStoreCustomerInStorage,
} from 'razorpay';

/**
 * A valid contact can only contain
 * - number
 * - spaces
 * - hyphens
 * - parenthesis
 * - plus
 *
 * @param {string} contact
 *
 * @returns {boolean}
 */
function doesContactHaveValidCharacters(contact) {
  return !/[^\d\+\s\-\(\)]+/.test(contact);
}

export const getPrefilledContact = () => {
  let prefilledContact = getOption('prefill.contact');
  const savedCustomer = getPreferences('customer');

  if (savedCustomer && savedCustomer.contact) {
    /* saved card details take priority over prefill */
    prefilledContact = savedCustomer.contact;
  } else if (shouldStoreCustomerInStorage()) {
    // from localstorage
    const storedUserDetails = ContactStorage.get();
    // Pick details from storage if not given in prefill
    if (!prefilledContact && storedUserDetails.contact) {
      prefilledContact = storedUserDetails.contact;
    }
  }

  // validate contact detail
  if (prefilledContact) {
    if (doesContactHaveValidCharacters(prefilledContact)) {
      const formattedContact = findCountryCode(prefilledContact);
      const newContact = '+' + formattedContact.code + formattedContact.phone;
      if (prefilledContact !== newContact) {
        prefilledContact = newContact;
      }
    }
  }
  return prefilledContact;
};

export const getPrefilledEmail = () => {
  let prefilledEmail = getOption('prefill.email');
  const savedCustomer = getPreferences('customer');

  if (savedCustomer && savedCustomer.email) {
    /* saved card details take priority over prefill */
    prefilledEmail = savedCustomer.email;
  } else if (shouldStoreCustomerInStorage()) {
    // from localstorage
    const storedUserDetails = ContactStorage.get();
    // Pick details from storage if not given in prefill
    if (!prefilledEmail && storedUserDetails.email) {
      prefilledEmail = storedUserDetails.email;
    }
  }
  return prefilledEmail;
};

/**
 * readonly
 */
export const isNameReadOnly = () =>
  getOption('readonly.name') && getOption('prefill.name');

export function isContactReadOnly() {
  return getOption('readonly.contact') && getPrefilledContact();
}
export function isEmailReadOnly() {
  return getOption('readonly.email') && getPrefilledEmail();
}
export function isContactEmailReadOnly() {
  return isContactReadOnly() && isEmailReadOnly();
}
