import { getSession } from 'sessionmanager';
import { UPI_POLL_URL } from 'common/constants';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Backdrop from 'checkoutframe/components/backdrop';
import { getCheckoutBridge, storage } from './index';
import { handleBack as handleOneClickCheckoutBack } from 'one_click_checkout/sessionInterface';
import { getPrefillMethod, isOneClickCheckout } from 'razorpay';
import { backPressed as navBackPressed, isStackPopulated } from 'navstack';

/**
 * window.backPressed is called by Android SDK everytime android backbutton is
 * pressed by user. Checkout will handle the back button action if the user is
 * on a sub screen. Checkout will give a callback to android in case that there
 * no action that can be done on back button click.
 * @param  {String} callback This function is called when there is no back
 *                           button action to be done on checkout side.
 *                           Android prompts for closing checkout in that case
 */
export function backPressed(callback) {
  let CheckoutBridge = getCheckoutBridge();
  let session = getSession();

  let pollUrl = storage.call('getString', UPI_POLL_URL);

  if (pollUrl) {
    session.hideErrorMessage();
  }

  Analytics.track('back', {
    type: AnalyticsTypes.BEHAV,
    data: {
      source: 'device',
    },
  });

  if (isOneClickCheckout()) {
    if (isStackPopulated()) {
      navBackPressed();
    } else if (session.tab === 'home-1cc') {
      // session
      handleOneClickCheckoutBack();
    } else {
      session.back();
    }
    return;
  }

  if (isStackPopulated()) {
    navBackPressed();
  } else if (
    session?.tab &&
    !(getPrefillMethod() && session.get('theme.hide_topbar'))
  ) {
    /**
     * When an overlay is visible, there's some message
     * that's being shown to the user in a pop up.
     * All overlays currently show a backdrop,
     * if backdrop is present in DOM,
     * an overlay is visible to the user.
     *
     * #frame-backdrop is a Svelte component,
     * it won't be present in DOM if it's not visible.
     *
     * TODO: Use an overlay manager for this check when implemented.
     */
    if (Backdrop.isVisible()) {
      session.hideErrorMessage();
    } else {
      session.back();
    }
  } else {
    if (session?.homeTab?.canGoBack()) {
      session.homeTab.hideMethods();
    } else if (CheckoutBridge && _.isFunction(CheckoutBridge[callback])) {
      CheckoutBridge[callback]();
    } else {
      if (session?.get('theme.close_button')) {
        session.closeModal();
      }
    }
  }
}

export function setHistoryAndListenForBackPresses() {
  if (!shouldHandleBackPresses()) {
    return;
  }

  addDummyState();

  window.addEventListener('popstate', backHandlerForWeb);
}

export function stopListeningForBackPresses() {
  window.removeEventListener('popstate', backHandlerForWeb);
}

function backHandlerForWeb() {
  const session = getSession();
  if (!isModalVisible()) {
    // If still fetching the preferences, abort.
    const session = getSession();

    if (session.isOpen) {
      session.closeAndDismiss();
    }

    return;
  }

  backPressed();

  // Hide iframe if created for flows like capital flow & trigger cancel flow
  session.r._payment?.forceIframeElement?.window.hide();

  /**
   * The modal may have closed.
   * Check if it's open before adding a history state.
   */
  if (isModalVisible()) {
    addDummyState();
  }
}

/**
 * Tells whether or not we should handle back presses.
 *
 * @return {Boolean}
 */
function shouldHandleBackPresses() {
  let CheckoutBridge = getCheckoutBridge();
  let session = getSession();

  if (CheckoutBridge || !window.history || !session.get('modal.handleback')) {
    return false;
  }

  return true;
}

/**
 * Adds a dummy state to the page history.
 */
function addDummyState() {
  window.history.pushState(null, '');
}

function isModalVisible() {
  const session = getSession();
  return session && session.modal && session.modal.isShown;
}
