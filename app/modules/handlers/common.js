import * as MethodStore from 'checkoutstore/methods';
import { wallets } from 'common/wallet';
import Analytics from 'analytics';
import CardEvents from 'analytics/card';

/**
 * Replace the Retry button in error message overlay
 * @param {String} text
 * @param {Function} handleClick
 */
export function replaceRetryButton(text = 'OK', handleClick = (f) => f) {
  const existingButton = document.querySelector('#fd-hide');

  if (!existingButton) return;
  if (existingButton?.parentNode) {
    existingButton.parentNode.removeChild(existingButton);
  }

  const errorMessageContainer = document.querySelector('#error-message');
  if (!errorMessageContainer) return;

  const newButton = document.createElement('button');
  newButton.classList.add('btn');
  newButton.innerHTML = text;
  newButton.setAttribute('id', 'fd-ok');

  errorMessageContainer.appendChild(newButton);

  newButton.addEventListener('click', handleClick);
}

/**
 * Replace the Retry button in error message overlay with specific text
 * and hide the overlay when clicked on this button
 * @param {Session} session
 * @param {String} text
 */
export function replaceRetryButtonToDismissErrorMessage(session, text) {
  replaceRetryButton(text, () => {
    session.hide();
  });
}

export function hasPaypalOptionInErrorMetadata(errorMetadata) {
  if (!errorMetadata || typeof errorMetadata !== 'object') {
    return false;
  }

  let hasPaypal = false;

  if (Array.isArray(errorMetadata.next)) {
    errorMetadata.next.forEach((retryMethod) => {
      if (
        retryMethod.action === 'suggest_retry' &&
        Array.isArray(retryMethod.instruments) &&
        !hasPaypal
      ) {
        hasPaypal =
          retryMethod.instruments.filter(function (instruments) {
            return instruments.instrument === wallets.paypal.code;
          }).length > 0;
      }
    });
  }
  return hasPaypal;
}

/**
 * Check if ajax error response contains any retry method
 *
 * @param {object} errorMetadata
 * @returns boolean
 */
export function shouldRetryWithPaypal(errorMetadata) {
  if (!errorMetadata || typeof errorMetadata !== 'object') {
    return false;
  }

  const isPaypalEnabled =
    MethodStore.getWallets().filter(function (wallet) {
      return wallet.code === wallets.paypal.code;
    }).length > 0;

  return isPaypalEnabled && hasPaypalOptionInErrorMetadata(errorMetadata);
}

/**
 * addRetryPaymentMethodOnErrorModal is used to show retry payment with different method after payment failure.
 *
 * @param {object} errorMetadata
 */
export function addRetryPaymentMethodOnErrorModal(errorMetadata) {
  var errorMessageContainer = document.querySelector('#error-message');
  if (!errorMessageContainer) return;

  var existingPaypalContainer = document.querySelector('#fd-paypal-container');

  if (!shouldRetryWithPaypal(errorMetadata)) {
    // Remove Paypal container and show retry button
    if (existingPaypalContainer) {
      existingPaypalContainer.parentNode.removeChild(existingPaypalContainer);
    }
    if (errorMessageContainer.classList.contains('has-paypal')) {
      errorMessageContainer.classList.remove('has-paypal');
    }
    return;
  }

  // Hide retry button
  errorMessageContainer.classList.add('has-paypal');

  if (existingPaypalContainer) {
    existingPaypalContainer.parentNode.removeChild(existingPaypalContainer);
  }

  // Update error modal with paypal button
  if (hasPaypalOptionInErrorMetadata(errorMetadata)) {
    var paypalContainer = document.createElement('div');
    paypalContainer.setAttribute('id', 'fd-paypal-container');

    // create paypal button
    var paypalBtn = document.createElement('button');
    paypalBtn.classList.add('btn');
    paypalBtn.setAttribute('id', 'fd-paypal');
    paypalBtn.textContent = 'Pay With PayPal';
    paypalContainer.appendChild(paypalBtn);

    var that = this;

    paypalBtn.addEventListener('click', function () {
      Analytics.track(CardEvents.PAYPAL_RETRY_PAYPAL_BTN_CLICK);
      that.hideErrorMessage();
      if (that.screen !== 'wallet') {
        // switch to wallet tab and select paypal
        if (that.svelteCardTab) {
          that.svelteCardTab.setTabVisible(false);
        }
        that.switchTab('wallet');
        if (that.walletTab) {
          that.walletTab.onWalletSelection(wallets.paypal.code);
        }
      }
    });

    // create cancel button
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.textDecoration = 'underline';
    cancelBtn.setAttribute('id', 'fd-paypal-cancel');
    var cancelBtnContainer = document.createElement('div');
    cancelBtnContainer.classList.add('error-cancel-btn-container');
    cancelBtnContainer.appendChild(cancelBtn);
    paypalContainer.appendChild(cancelBtnContainer);

    errorMessageContainer.appendChild(paypalContainer);

    cancelBtn.addEventListener('click', function () {
      Analytics.track(CardEvents.PAYPAL_RETRY_CANCEL_BTN_CLICK);
      that.hideErrorMessage.call(that);
    });

    // Track paypal button visible on UI
    Analytics.track(CardEvents.SHOW_PAYPAL_RETRY_SCREEN);
  }
}
