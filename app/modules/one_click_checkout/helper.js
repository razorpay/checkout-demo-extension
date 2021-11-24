import {
  isLoginMandatory,
  shouldShowAddress,
  shouldShowCoupons,
} from 'one_click_checkout/store';
import { otpReasons } from 'one_click_checkout/otp/constants';
import { views } from 'one_click_checkout/routing/constants';
import { screensHistory } from 'one_click_checkout/routing/History';
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { askForOTP } from 'one_click_checkout/common/otp';
import { tick } from 'svelte';
import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';

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
