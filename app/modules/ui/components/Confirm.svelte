<script lang="ts">
  // i18n
  import { t } from 'svelte-i18n';
  import {
    CONFIRM_CANCEL_HEADING,
    CONFIRM_CANCEL_MESSAGE,
    CONFIRM_CANCEL_POSITIVE_TEXT,
    CONFIRM_CANCEL_NEGATIVE_TEXT,
  } from 'ui/labels/confirm';

  // Svelte imports
  import { fly } from 'svelte/transition';

  // Utils imports
  import { popStack } from 'navstack';
  import { isOneClickCheckout } from 'razorpay';

  // Analytics imports
  import { CLOSE_MODAL_OPTIONS } from 'one_click_checkout/analytics/constants';
  import OneCCEvents from 'one_click_checkout/analytics';
  import { Events } from 'analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  // LABEL: Cancel payment?
  export let heading = $t(CONFIRM_CANCEL_HEADING);
  // LABEL: Your payment is ongoing. Are you sure you want to cancel the payment?
  export let message = $t(CONFIRM_CANCEL_MESSAGE);
  export let layout = 'ltr';
  // LABEL: Yes, cancel
  export let positiveText = $t(CONFIRM_CANCEL_POSITIVE_TEXT);
  // LABEL: No
  export let negativeText = $t(CONFIRM_CANCEL_NEGATIVE_TEXT);
  export let onPositiveClick = Boolean;
  export let onNegativeClick = Boolean;
  const isOneCCEnabled = isOneClickCheckout();

  function clickedPositive() {
    popStack();
    onPositiveClick();
    if (isOneCCEnabled) {
      Events.TrackBehav(OneCCEvents.CLOSE_MODAL_OPTION, {
        screen_name: getCurrentScreen(),
        option_selected: CLOSE_MODAL_OPTIONS.POSITIVE,
      });
    }
  }

  function clickedNegative() {
    popStack();
    onNegativeClick();
    if (isOneCCEnabled) {
      Events.TrackBehav(OneCCEvents.CLOSE_MODAL_OPTION, {
        screen_name: getCurrentScreen(),
        option_selected: CLOSE_MODAL_OPTIONS.NEGATIVE,
      });
    }
  }

  export function preventBack() {
    onNegativeClick();
    return false;
  }
</script>

<div
  id="confirmation-dialog"
  transition:fly={{ duration: 300, y: -24 }}
  class="confirm-container overlay"
>
  <div class="confirm-heading">{heading}</div>
  <div class="confirm-message">{message}</div>
  <div class="confirm-buttons" class:reverse={layout === 'rtl'}>
    <div id="positiveBtn" class="text-btn" on:click={clickedPositive}>
      {positiveText}
    </div>
    <div id="negativeBtn" class="text-btn" on:click={clickedNegative}>
      {negativeText}
    </div>
  </div>
</div>

<style lang="scss">
  #confirmation-dialog {
    top: 6px;
    z-index: 999;
    bottom: auto;
    width: 95%;
    left: 2.5%;
  }
  .confirm-container {
    background: #fff;
    right: 12px;
    left: 12px;
    text-align: left;
    font-size: 14px;
    padding: 24px;
    padding-bottom: 12px;
    border-radius: 3px;
    box-shadow: 0 15px 12px 0 rgba(0, 0, 0, 0.22),
      0 19px 38px 0 rgba(0, 0, 0, 0.3);
  }

  .confirm-heading {
    color: #717171;
    letter-spacing: 1px;
    line-height: 17px;
    text-transform: uppercase;
    border-bottom: 1px solid #f3f3f3;
    padding: 0 0 8px 0;
  }

  .confirm-message {
    margin-top: 12px;
    color: rgba(0, 0, 0, 0.56);
    line-height: 20px;
  }

  .confirm-buttons {
    display: flex;
    margin-top: 8px;
    flex-wrap: nowrap;
  }

  .confirm-buttons.reverse {
    flex-direction: row-reverse;
  }

  .text-btn {
    display: inline-block;
    margin-right: 12px;
    padding-right: 12px;
    font-size: 14px;
    letter-spacing: 1px;
    line-height: 40px;
  }

  :global(.one-cc) .confirm-container {
    padding: 20px 16px;
  }

  :global(.one-cc) .confirm-heading {
    letter-spacing: normal;
    text-transform: none;
    color: var(--primary-text-color);
    font-weight: var(--font-weight-semibold);
    border-bottom: 1px solid #e1e5ea;
    padding: 0 0 12px 0;
  }

  :global(.one-cc) .confirm-message {
    color: var(--secondary-text-color);
  }

  :global(.one-cc) .confirm-buttons {
    margin-top: 16px;
  }

  :global(.redesign) .text-btn {
    letter-spacing: normal;
    line-height: normal;
    text-transform: none;
    font-weight: var(--font-weight-semibold);
  }
  /** will need this when we migrate modal design */
  // :global(.redesign) {
  //   #confirmation-dialog {
  //     top: 0;
  //     top: unset;
  //     left: 0;
  //     width: 100%;
  //     padding: 24px 20px;
  //   }

  //   .confirm-heading {
  //     color: #3f71d7;
  //     border-bottom: 0;
  //     padding-bottom: 0;
  //     letter-spacing: normal;
  //     text-transform: none;
  //     font-weight: 600;
  //   }

  //   .confirm-message {
  //     color: #8d97a1;
  //   }

  //   .confirm-buttons {
  //     flex-direction: row-reverse;
  //     justify-content: space-between;
  //   }
  //   .text-btn {
  //     letter-spacing: normal;
  //     line-height: normal;
  //     text-transform: none;
  //     font-weight: 600;
  //     width: calc(100% - 10px);
  //     padding: 15px;
  //     border-radius: 5px;
  //     text-align: center;

  //     &#positiveBtn {
  //       background: var(--primary-color);
  //       color: var(--text-color);
  //     }

  //     &#negativeBtn {
  //       border: 1px solid var(--primary-color);
  //       color: var(--primary-color);
  //     }
  //   }
  // }
</style>
