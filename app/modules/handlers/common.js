import * as MethodStore from 'checkoutstore/methods';
import { setBackdropClick } from 'checkoutstore/backdrop';
import { wallets } from 'common/wallet';
import Analytics from 'analytics';
import CardEvents from 'analytics/card';

/**
 * Add subtext to passed in parent
 * @param {string} subText
 * @param {HTMLElement} parent
 * @returns {string} id of the subtext
 */
function addSubtextToActionArea(subText, parent) {
  const subTextId = `fd-st`;
  if (!subText || !parent) {
    return;
  }
  const existingSubText = document.querySelector(`#fd-st`);
  existingSubText?.parentNode?.removeChild(existingSubText);

  const newSubText = document.createElement('div');
  newSubText.style = `white-space: normal;padding: 0px 20px 10px 20px;line-height: 22px;font-size:12px`;
  newSubText.innerHTML = subText;
  // use the text converted to lowercase with space replaced by `-` as id
  newSubText.setAttribute('id', subTextId);
  parent.appendChild(newSubText);
  // for future reference of ordering
  return newSubText;
}
/**
 * Replace the Retry button in error message overlay
 * @param {HTMLElement} parent
 * @param {string} label
 * @param {Function} handleClick
 * @param {"replace"|"add"} [type="replace"]
 * @param {string} replacerId id of item to used for replacement
 */
function updateButton(
  parent,
  label = 'OK',
  handleClick = (f) => f,
  type = 'replace',
  replacerId = 'fd-hide'
) {
  if (type === 'replace') {
    const existingButton = document.querySelector(`#${replacerId}`);
    if (!existingButton) return;
    existingButton?.parentNode?.removeChild(existingButton);
  }

  const newButton = document.createElement('button');
  newButton.classList.add('btn');
  newButton.addEventListener('click', handleClick);

  // use the text converted to lowercase with space replaced by `-` as id
  newButton.setAttribute(
    'id',
    `fd-${label.toLocaleLowerCase().replace(/ /g, '-')}`
  );
  newButton.innerHTML = label;

  parent.appendChild(newButton);
}

/**
 * Update the content presented to the user in the overlay
 * Replace the action buttons with custom text and on-click actions.
 * Add customized subtext above the button.
 * @param {Session} session
 * @param {string} buttonLabel
 * @param {string} [subText] custom subtext to render
 * @param {boolean} [avoidBackdropClick] boolean to control the clicks on backdrop
 * @param {()=>void} [onClick] function to control the on-click. This will override the default hide functionality.
 */
export function updateActionAreaContentAndCTA(
  session,
  buttonLabel,
  subText,
  avoidBackdropClick,
  onClick
) {
  const errorMessageContainer = document.querySelector('#error-message');
  if (!errorMessageContainer) return;
  // disable the backdrop clicks to leak the flow.

  if (avoidBackdropClick) {
    setBackdropClick(false);
  }
  addSubtextToActionArea(subText, errorMessageContainer);

  const onButtonClick = () => {
    // irrespective of the next action, revert the disabled actions on backdrop(if any)
    if (avoidBackdropClick) {
      setBackdropClick(true);
    }
    if (!onClick) {
      session.hide();
    }
  };
  updateButton(errorMessageContainer, buttonLabel, onButtonClick);
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

  Analytics.track(CardEvents.PAYPAL_RETRY_PAYPAL_ENABLED, {
    data: {
      paypalEnable: isPaypalEnabled,
    },
  });

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

      Analytics.track(CardEvents.PAYPAL_RETRY_PAYPAL_BTN_CLICK, {
        data: {
          currentScreen: this.screen,
        },
        immediately: true,
      });
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
      Analytics.track(CardEvents.PAYPAL_RETRY_CANCEL_BTN_CLICK, {
        currentScreen: that.screen,
      });
      that.hideErrorMessage.call(that);
    });

    // Track paypal button visible on UI
    Analytics.track(CardEvents.SHOW_PAYPAL_RETRY_SCREEN, {
      data: {
        errorMetadata,
      },
      immediately: true,
    });
  }
}
