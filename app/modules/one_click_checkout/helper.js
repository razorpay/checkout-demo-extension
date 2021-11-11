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
import {
  isLoginMandatory,
  shouldShowAddress,
  shouldShowCoupons,
} from 'one_click_checkout/store';
import { otpReasons } from 'one_click_checkout/otp/constants';
import { views } from 'one_click_checkout/routing/constants';
import { country, phone, contact, email } from 'checkoutstore/screens/home';
import { get } from 'svelte/store';
import { screensHistory } from 'one_click_checkout/routing/History';
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { askForOTP } from 'one_click_checkout/common/otp';
import { tick } from 'svelte';

/**
 * Determines if user contact and email is valid
 *
 * @returns {[boolean, boolean]}
 */
export function validateEmailAndContact() {
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

/**
 * Determines where a user should be if
 * they were landing on the homescreen as the first screen.
 *
 * @returns {string} view
 */
export function determineLandingView() {
  const { DETAILS, ADDRESS, COUPONS } = views;

  const [isContactValid, isEmailValid] = validateEmailAndContact();
  if (isLoginMandatory() && !isUserLoggedIn()) {
    if (isContactValid && isEmailValid) {
      tick().then(() => {
        askForOTP(otpReasons.mandatory_login);
      });
    }
    return DETAILS;
  }
  if (shouldShowCoupons()) {
    return COUPONS;
  }
  if (shouldShowAddress()) {
    if (!isContactValid || !isEmailValid) {
      return DETAILS;
    } else {
      screensHistory.initialize(views.DETAILS);
      return ADDRESS;
    }
  }
}
