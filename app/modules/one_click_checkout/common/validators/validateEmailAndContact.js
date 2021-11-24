import {
  CONTACT_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX_INDIA,
} from 'common/constants';
import {
  isContactOptional,
  isEmailOptional,
  isContactEmailOptional,
} from 'checkoutstore';

import { country, phone, contact, email } from 'checkoutstore/screens/home';
import { get } from 'svelte/store';

/**
 * Determines if user contact and email is valid
 *
 * @returns {[boolean, boolean]}
 */
export default function validateEmailAndContact() {
  /**
   * Mark contact and email as invalid by default
   */
  let isContactValid = false;
  let isEmailValid = false;

  /**
   * Mark optional fields as valid
   */
  if (isContactOptional()) {
    isContactValid = true;
  }
  if (isEmailOptional()) {
    isEmailValid = true;
  }

  /**
   * If contact and email are mandatory, validate
   */
  if (!isContactEmailOptional()) {
    if (!isContactValid) {
      if (get(country) === '+91') {
        isContactValid = PHONE_REGEX_INDIA.test(get(phone));
      } else {
        isContactValid = CONTACT_REGEX.test(get(contact));
      }
    }

    isEmailValid = isEmailValid || EMAIL_REGEX.test(get(email));
  }

  return [isContactValid, isEmailValid];
}
