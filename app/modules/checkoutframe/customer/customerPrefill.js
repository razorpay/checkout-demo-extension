import { findCountryCode } from 'common/countrycodes';
import * as ContactStorage from 'checkoutframe/contact-storage';
import {
  getOption,
  getPreferences,
  isPrefilledAndReadOnlyContact,
  isPrefilledAndReadOnlyEmail,
  shouldStoreCustomerInStorage,
} from 'razorpay';
import { capture, SEVERITY_LEVELS } from 'error-service';
import Analytics from 'analytics';

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
  // added for error capturing
  const analyticData = {};
  try {
    let prefilledContact = getOption('prefill.contact');
    const savedCustomer = getPreferences('customer');
    // override contact only if its not prefill and not read only
    const shouldOverridePrefill = !isPrefilledAndReadOnlyContact();
    if (shouldOverridePrefill) {
      if (savedCustomer && savedCustomer.contact) {
        /* saved card details take priority over prefill if not readonly */
        prefilledContact = savedCustomer.contact;
      } else if (shouldStoreCustomerInStorage()) {
        // from localstorage
        const storedUserDetails = ContactStorage.get();
        // Pick details from storage if not given in prefill
        if (!prefilledContact && storedUserDetails.contact) {
          Analytics.setMeta('contact_prefill_source', 'browserstorage');
          prefilledContact = storedUserDetails.contact;
        }
      }
    }
    analyticData.prefilledContact = prefilledContact;
    analyticData.typeOfPrefilledContact = typeof prefilledContact;

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
  } catch (e) {
    capture(e, {
      severity: SEVERITY_LEVELS.S2,
      analytics: {
        data: analyticData,
      },
    });
  }
  return '';
};

export const getPrefilledEmail = () => {
  let prefilledEmail = getOption('prefill.email');
  const savedCustomer = getPreferences('customer');

  const shouldOverridePrefill = !isPrefilledAndReadOnlyEmail();
  // override email only if its not prefill and not read only
  if (shouldOverridePrefill) {
    if (savedCustomer && savedCustomer.email) {
      /* saved card details take priority over prefill if not readonly */
      prefilledEmail = savedCustomer.email;
    } else if (shouldStoreCustomerInStorage()) {
      // from localstorage
      const storedUserDetails = ContactStorage.get();
      // Pick details from storage if not given in prefill
      if (!prefilledEmail && storedUserDetails.email) {
        Analytics.setMeta('email_prefill_source', 'browserstorage');
        prefilledEmail = storedUserDetails.email;
      }
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
