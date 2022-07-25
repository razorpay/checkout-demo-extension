import { getOption, getPreferences, isOneClickCheckout } from 'razorpay';
import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';
import Analytics from 'analytics';

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

export function screenScrollTop(element) {
  if (element) {
    element.scrollTop = 0;
  }
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
    getOption('mandatory_login')
  );
  Analytics.setMeta(
    OneClickCheckoutMetaProperties.IS_ONE_CLICK_CHECKOUT,
    isOneClickCheckout()
  );
}
