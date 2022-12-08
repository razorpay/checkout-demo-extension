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
  scriptCouponApplied,
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
import { PHONE_NUMBER_LENGTH_INDIA } from 'common/constants';
import { getElementById } from 'utils/doc';
import * as _ from 'utils/_';
import {
  CONTACT_ERROR_LABEL,
  INDIA_CONTACT_ERROR_LABEL,
} from 'one_click_checkout/address/i18n/labels';

export function clickOutside(node, condition = true) {
  if (!condition) {
    return;
  }
  const handleClick = (event) => {
    if (
      node &&
      !node.contains(event.target) &&
      !event.defaultPrevented &&
      typeof node.dispatchEvent === 'function'
    ) {
      // in IE11 type of CustomEvent comes as Object using an IE-compatible Custom Event in that case
      if (typeof CustomEvent === 'function') {
        node.dispatchEvent(new CustomEvent('click_outside', node));
      } else {
        node.dispatchEvent(_.CustomEvent('click_outside', node));
      }
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
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.SCRIPT_EDITED_COUPON_APPLIED,
    scriptCouponApplied()
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

export function getIndErrLabel(phone) {
  return phone.length === PHONE_NUMBER_LENGTH_INDIA || !phone
    ? CONTACT_ERROR_LABEL
    : INDIA_CONTACT_ERROR_LABEL;
}
