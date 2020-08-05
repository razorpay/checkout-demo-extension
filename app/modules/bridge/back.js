import { getSession } from 'sessionmanager';
import { SHOWN_CLASS, UPI_POLL_URL } from 'common/constants';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import * as Confirm from 'confirm';
import * as TermsCurtain from 'checkoutframe/termscurtain';
import { getCheckoutBridge, storage } from './index';
import { confirmCancelMsg } from 'common/strings';
import { get as storeGetter } from 'svelte/store';
import { overlayStack as overlayStackStore } from 'checkoutstore/back';

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

  // The same logic to close overlays using $overlayStack
  // is present for Modal.handleBackdropClick
  // Don't forget to update it there too if you change something here.
  // TODO: DRY

  const $overlayStack = storeGetter(overlayStackStore);

  // TODO: All overlays should be hidden using $overlayStack

  if ($overlayStack.length > 0) {
    const last = $overlayStack[$overlayStack.length - 1];

    last.back({
      from: 'back',
    });

    return;
  }

  if (Confirm.isConfirmShown) {
    Confirm.hide(true);
  } else if (TermsCurtain.isVisible()) {
    TermsCurtain.hide();
  } else if (
    session.tab &&
    !(session.get('prefill.method') && session.get('theme.hide_topbar'))
  ) {
    /**
     * When an overlay is visible, there's some message
     * that's being shown to the user in a pop up.
     *
     * TODO: Use an overlay manager for this check when implemented.
     */
    const overlays = [
      _Doc.querySelector('#fee-wrap'),
      _Doc.querySelector('#overlay'),
    ];
    const visibleOverlays = _Arr.filter(overlays, overlay => {
      return overlay && _El.hasClass(overlay, SHOWN_CLASS);
    });

    if (visibleOverlays.length) {
      session.hideErrorMessage();
    } else {
      session.back();
    }
  } else {
    if (session.homeTab && session.homeTab.canGoBack()) {
      session.homeTab.hideMethods();
    } else if (CheckoutBridge && _.isFunction(CheckoutBridge[callback])) {
      CheckoutBridge[callback]();
    } else {
      if (session.get('theme.close_button')) {
        closeModal();
      }
    }
  }
}

function closeModal() {
  const session = getSession();

  if (session.get('modal.confirm_close')) {
    Confirm.show({
      message: confirmCancelMsg,
      heading: 'Cancel Payment?',
      positiveBtnTxt: 'Yes, cancel',
      negativeBtnTxt: 'No',
      onPositiveClick: function() {
        session.hide();
      },
    });
  } else {
    session.hide();
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
  if (!isModalVisible()) {
    // If still fetching the preferences, abort.
    const session = getSession();

    if (session.isOpen) {
      session.closeAndDismiss();
    }

    return;
  }

  backPressed();

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
  window.history.pushState({}, null, '');
}

function isModalVisible() {
  const session = getSession();
  return session && session.modal && session.modal.isShown;
}
