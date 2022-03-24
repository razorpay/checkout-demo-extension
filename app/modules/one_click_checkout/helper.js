import {
  isLoginMandatory,
  shouldShowAddress,
  shouldShowCoupons,
} from 'one_click_checkout/store';
import { otpReasons } from 'one_click_checkout/otp/constants';
import { views } from 'one_click_checkout/routing/constants';
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { askForOTP } from 'one_click_checkout/common/otp';
import { tick } from 'svelte';
import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';
import { navigator } from 'one_click_checkout/routing/helpers/routing';

/**
 * Determines where a user should be if
 * they were landing on the homescreen as the first screen.
 *
 * @returns {string} view
 */
export function determineLandingView() {
  const { DETAILS, SAVED_ADDRESSES, COUPONS } = views;

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
      navigator.navigateTo({ path: views.DETAILS, initialize: true });
      return SAVED_ADDRESSES;
    }
  }
}

export function clickOutside(node) {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('click_outside', node));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}

export const isScrollable = (node) => {
  const hasScrollableContent = node.scrollHeight > node.clientHeight;

  const overflowYStyle = window.getComputedStyle(node).overflowY;
  const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

  return hasScrollableContent && !isOverflowHidden;
};

export const getScrollableParent = (node) => {
  if (node === null) {
    return null;
  }

  if (isScrollable(node)) {
    return node;
  } else {
    return getScrollableParent(node.parentNode);
  }
};
