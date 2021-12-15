<script>
  // Declarations and Import Statements
  import SecureCardKnowMore from './SecureCardKnowMore.svelte';
  import { t, locale } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';

  import { Events, CardEvents } from 'analytics/index';
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import { showSavedCardTooltip } from 'checkoutstore/screens/card';
  let secureCardKnowMoreView;
  import {
    isRecurring,
    getOption,
    isSubscription,
    getPreferences,
  } from 'razorpay';
  import { formatTemplateWithLocale } from 'i18n';

  //i18n
  import {
    SAVE_CARD_TEXT,
    KNOW_MORE,
    SAVE_CARD_TEXT_NEW_CARD,
    SAVED_CARD_CHECKBOX_TOOLTIP,
  } from 'ui/labels/card';

  // Export statements
  export let checked;
  export let savedcard;
  export let modalType;
  export let name = 'save';
  export let merchantName = getOption('name');
  export let maxAmount = getSession().formatAmountWithCurrency(
    getPreferences('order.max_amount')
  );
  export let cvvRef;
  export let network;
  // Function for hiding the modal
  const hidSecureCardKnowMoreDialog = () => {
    if (secureCardKnowMoreView) {
      hideOverlayMessage();
    }
    if (cvvRef) {
      cvvRef.focus();
    }
  };

  // Function for showing the modal
  const showSecureCardKnowMoreDialog = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    Razorpay.sendMessage({ event: 'blur' });
    if (cvvRef) {
      cvvRef.blur();
    }
    const secureCardDiv = document.getElementById('secure-card-know-more-wrap');

    // deleting the instance of the know more modal if already present
    const previousInstance = document.getElementById('know-more-modal');
    if (secureCardDiv.contains(previousInstance)) {
      previousInstance.parentElement.removeChild(previousInstance);
      secureCardKnowMoreView = undefined;
    }

    // creating a new instance of child
    if (!secureCardKnowMoreView) {
      secureCardKnowMoreView = new SecureCardKnowMore({
        target: secureCardDiv,
        props: {
          onClick: hidSecureCardKnowMoreDialog,
          modalType,
        },
      });
    }

    Events.TrackBehav(CardEvents.TOKENIZATION_KNOW_MORE_MODAL, {
      action: 'opened',
      modalType,
    });
    showOverlay([secureCardDiv]);
  };
  function trackUserConsentForTokenization(event) {
    $showSavedCardTooltip = false;
    if (modalType.includes('add')) {
      // in add-card flow we already have remember user event
      return;
    }
    Events.TrackBehav(CardEvents.USER_CONSENT_FOR_TOKENIZATION, {
      block: modalType.includes('p13n') ? 'p13n' : 'saved-card',
      active: event.target.checked,
    });
  }

  onMount(() => {
    // if network supplied it means saved card usage and we shouldn check for all networks by default
    if (network) {
      checked = true;
    }
    // In case of recurring flow, we need explicit user consent to save card, hence default will be unchecked
    if (isRecurring()) {
      checked = false;
    }
  });
</script>

<div
  class:secure-card-block={modalType !== 'add-new-card'}
  class:secure-card-block-saved-cards={Boolean(savedcard)}
>
  <!-- do not modify the id of label tag, this id has a multiple bug fixes in session -->
  <label
    class="first save_card_label_text"
    for={name}
    id="should-save-card"
    tabIndex="0"
    class:save_card_label_text={modalType === 'add-new-card'}
  >
    <div class="save-card-container">
      <div>
        <input
          type="checkbox"
          class="checkbox--square"
          id={name}
          on:focus
          on:change={trackUserConsentForTokenization}
          on:change
          bind:checked
          {name}
        />
        <span class="checkbox">
          <!-- if add-new-card flow and recurring -->
          {#if modalType === 'add-new-card' && isRecurring()}
            <Tooltip
              align={['top', 'right']}
              className="subscription-flow-save-card-tooltip"
              shown={$showSavedCardTooltip}
            >
              {$t(SAVED_CARD_CHECKBOX_TOOLTIP)}
            </Tooltip>
          {/if}
        </span>
      </div>
      <div>
        <!-- LABEL: Keep card saved for future payments -->
        <span
          class="saved-card-text"
          class:saved-card-text-saved-card-screen={Boolean(savedcard)}
          class:saved-card-text-for-add-card={modalType === 'add-new-card'}
        >
          {#if modalType === 'add-new-card'}
            {$t(SAVE_CARD_TEXT_NEW_CARD)}
            <!-- Only for recurring payments show the subtitle/helper text -->
            {#if isRecurring()}
              <!-- For subscription links message is different -->
              {#if isSubscription()}
                <div class="save-card-subtext">
                  {formatTemplateWithLocale(
                    'card.save_card_know_more_add_card_modal_subtitle_subscription',
                    { merchantName },
                    $locale
                  )}
                </div>
              {:else}
                <!-- For caw links message is different -->
                <div class="save-card-subtext">
                  {formatTemplateWithLocale(
                    'card.save_card_know_more_add_card_modal_subtitle_caw',
                    { merchantName, maxAmount },
                    $locale
                  )}
                </div>
              {/if}
            {/if}
          {:else}
            {$t(SAVE_CARD_TEXT)}
          {/if}
        </span>
      </div>
    </div>
  </label>
  <span
    class="know-more-text"
    class:know-more-text-saved-cards={Boolean(savedcard)}
    class:know-more-text-add-card={modalType === 'add-new-card'}
  >
    <span on:click={showSecureCardKnowMoreDialog} class="cusor-pointer">
      {$t(KNOW_MORE)}
    </span>
    <!-- LABEL: Know More-->
  </span>
</div>

<style>
  .secure-card-block {
    margin-left: 5 px;
    margin-top: 10 px;
  }

  .saved-card-text {
    font-size: 12px;
    line-height: 12px;
    color: #373737;
  }
  .saved-card-text-for-add-card {
    font-size: 12px;
    line-height: 14px;
  }
  .saved-card-text-saved-card-screen {
    margin-left: 5px;
  }

  .know-more-text {
    display: block;
    font-size: 12px;
    line-height: 11px;
    margin-left: 25px;
    color: #3f71d7;
    text-decoration: underline;
    cursor: pointer;
  }
  .know-more-text-add-card {
    font-size: 12px;
    line-height: 14px;
    margin-left: 30px;
  }

  .know-more-text-saved-cards {
    top: -12px;
    position: relative;
    margin-left: 30px;
  }

  .secure-card-block-saved-cards {
    top: -10px;
    position: relative;
    margin-bottom: 0px;
    margin-top: 0px;
    margin-left: 16px;
  }

  .cusor-pointer {
    cursor: pointer;
  }
  .save_card_label_text {
    display: block;
    margin-bottom: 2px;
    float: left;
    margin-left: 30px;
  }

  .save_card_label_text .checkbox {
    margin-left: -30px;
  }

  .save-card-container {
    display: flex;
    flex-direction: row;
  }

  .save-card-subtext {
    font-size: 12px;
    color: #8895a8;
  }

  :global(.tooltip.subscription-flow-save-card-tooltip.tooltip-shown.tooltip-bottom.tooltip-right) {
    opacity: 0.9;
    width: 36vh;
  }
  :global(.tooltip.subscription-flow-save-card-tooltip.tooltip-shown.tooltip-top.tooltip-right) {
    opacity: 0.9;
    width: 21vh;
  }
</style>
