import {
  CONTACT_REGEX,
  EMAIL_REGEX,
  INDIAN_CONTACT_REGEX,
} from 'common/constants';

import {
  isContactOptional,
  isEmailOptional,
  isContactEmailOptional,
} from 'razorpay';

import { get } from 'svelte/store';
import { country, contact, email } from 'checkoutstore/screens/home';

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
        isContactValid = INDIAN_CONTACT_REGEX.test(get(contact));
      } else {
        isContactValid = CONTACT_REGEX.test(get(contact));
      }
    }

    isEmailValid = isEmailValid || EMAIL_REGEX.test(get(email));
  }

  return [isContactValid, isEmailValid];
}
