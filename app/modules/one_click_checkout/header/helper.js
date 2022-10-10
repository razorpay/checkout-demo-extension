import { get } from 'svelte/store';
import { isOneClickCheckout } from 'razorpay';
import {
  headerVisible,
  headerHiddenOnScroll,
  shouldOverrideVisibleState,
} from 'one_click_checkout/header/store';
import { activeRoute } from 'one_click_checkout/routing/store';
import { FORCED_HEADER_VIEWS } from 'one_click_checkout/header/constants';

export const toggleHeader = (show) => {
  if (isOneClickCheckout()) {
    headerVisible.set(show);
  }
};

/**
 * Computes whether Header needs to be hidden at a point in the page scroll
 * @param {HTMLElement} contentRef the scrolling element in the page
 * @param {boolean} onScreenMount Whether onscroll is being called onMount of the Screen
 */
export const onScrollToggleHeader = (contentRef) => {
  if (!isOneClickCheckout()) {
    return;
  }

  if (FORCED_HEADER_VIEWS.includes(get(activeRoute)?.name)) {
    headerHiddenOnScroll.set(false);
    return;
  }

  const {
    scrollHeight, // Actual height of the element
    scrollTop, // How much has already been scrolled
  } = contentRef;

  const headerHidingThreshold = scrollHeight * 0.05;

  if (scrollTop > headerHidingThreshold) {
    headerHiddenOnScroll.set(true);
    shouldOverrideVisibleState.set(true);
  } else if (scrollTop <= headerHidingThreshold) {
    if (!get(shouldOverrideVisibleState)) {
      return;
    }
    headerHiddenOnScroll.set(false);
  }
};
