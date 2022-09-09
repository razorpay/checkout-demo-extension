// store imports
import { get } from 'svelte/store';
import { email } from 'checkoutstore/screens/home';
import {
  isContactValid,
  isEmailValid,
} from 'one_click_checkout/common/details/store';
import {
  getOption,
  getPreferences,
  isOneClickCheckout,
  isMandatoryLoginEnabled,
} from 'razorpay';

// Analytics imports
import Analytics from 'analytics';
import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';

// validators/utils imports
import { validateEmail } from 'one_click_checkout/common/validators/email';
import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';
import {
  CONTACT_REGEX,
  INDIA_COUNTRY_CODE,
  INDIAN_CONTACT_REGEX,
} from 'common/constants';
import { getElementById } from 'utils/doc';

export function clickOutside(node) {
  const handleClick = (event) => {
    if (
      node &&
      !node.contains(event.target) &&
      !event.defaultPrevented &&
      typeof node.dispatchEvent === 'function'
    ) {
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

export function screenScrollTop(element) {
  if (element) {
    element.scrollTop = 0;
  }
}
export const isScrollable = (node) => {
  // getComputedStyle is allowed only on ElementNode
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#throws
  const isElementNode = node.nodeType === node.ELEMENT_NODE;
  if (!isElementNode) {
    return false;
  }

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
  }
  return getScrollableParent(node.parentNode);
};

export function init1CCMetaData() {
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.ADDRESS_ENABLED,
    getOption('show_address')
  );
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.COUPONS_ENABLED,
    getOption('show_coupons')
  );
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.COD_ENABLED,
    getPreferences('methods.cod') || false
  );
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.IS_MANDATORY_SIGNUP,
    isMandatoryLoginEnabled()
  );
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.IS_ONE_CLICK_CHECKOUT,
    isOneClickCheckout()
  );
}

export function validatePrefilledDetails() {
  if (!isOneClickCheckout()) {
    return;
  }

  const [emailRegexValid, contactRegexValid] = validateEmailAndContact();
  validateEmail(get(email)).then((valid) => {
    isEmailValid.set(valid && emailRegexValid);
  });
  isContactValid.set(contactRegexValid);
}

export function getPhoneNumberRegex(country) {
  return country === INDIA_COUNTRY_CODE ? INDIAN_CONTACT_REGEX : CONTACT_REGEX;
}

/**
 * Determines source of input - wether it was a manual entry or via autocomplete suggestions.
 * Autofill, changes background of input to a different color. We compare this with initial color passed by us.
 *
 */
export function getInputSource(elementId, defaultColor = 'rgba(0, 0, 0, 0)') {
  const el = getElementById(elementId);
  const currentBackground = window?.getComputedStyle(el)?.backgroundColor;

  return currentBackground === defaultColor ? 'manual' : 'selection';
}
