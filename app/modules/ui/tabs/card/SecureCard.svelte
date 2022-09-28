<script lang="ts">
  // Declarations and Import Statements
  import SecureCardKnowMore from './SecureCardKnowMore.svelte';
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import Razorpay from 'common/Razorpay';
  import { pushOverlay } from 'navstack';

  import { Events, CardEvents } from 'analytics/index';
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import { showSavedCardTooltip } from 'checkoutstore/screens/card';
  import { isRecurring, isSubscription } from 'razorpay';
  import { iPhone } from 'common/useragent';

  //i18n
  import {
    KNOW_MORE,
    SAVE_CARD_TEXT,
    RECURRING_CALLOUT,
    SAVE_CARD_TEXT_NEW_CARD,
    SAVED_CARD_CHECKBOX_TOOLTIP,
    SAVE_CARD_SUBTITLE_SUBSCRIPTION,
  } from 'ui/labels/card';
  import { CardsTracker } from 'card/analytics/events';

  // Export statements
  export let checked;
  export let savedcard;
  export let modalType: string;
  export let name = 'save';
  export let cvvRef;
  export let network;

  // Function for showing the modal
  const showSecureCardKnowMoreDialog = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }

    if (cvvRef) {
      cvvRef.blur();
    }

    pushOverlay({
      component: SecureCardKnowMore,
      props: {
        modalType,
        cvvRef,
      },
    });

    Events.TrackBehav(CardEvents.TOKENIZATION_KNOW_MORE_MODAL, {
      action: 'opened',
      modalType,
    });
  };
  function trackUserConsentForTokenization(event) {
    CardsTracker.GEN_CARD_CONSENT_TOGGLED({
      instrument: {
        saveCardConsent: event?.target?.checked,
      },
    });
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

    CardsTracker.GEN_CONSENT_BOX_SHOWN({
      instrument: {
        saveCardConsent: checked,
        screenName: modalType,
      },
    });
  });
</script>

<div
  class:secure-card-block={modalType !== 'add-new-card'}
  class:p13n-block={modalType === 'p13n-existing-card'}
  class:secure-card-block-saved-cards={Boolean(savedcard)}
>
  <!-- do not modify the id of label tag, this id has a multiple bug fixes in session -->
  <label
    class="first save_card_label_text"
    for={name}
    id="should-save-card"
    tabIndex="0"
    class:save_card_label_text={modalType === 'add-new-card'}
    class:save-card-label-recurring={Boolean(isRecurring())}
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
          {#if $showSavedCardTooltip && isRecurring()}
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
      <div
        class="label-container"
        class:recurring-card-text={Boolean(isRecurring()) &&
          modalType === 'add-new-card'}
      >
        <!-- LABEL: Keep card saved for future payments -->
        <span
          class="saved-card-text"
          class:saved-card-text-saved-card-screen={Boolean(savedcard)}
        >
          {#if modalType === 'add-new-card'}
            {$t(SAVE_CARD_TEXT_NEW_CARD)}
            <!-- Only for recurring payments show the subtitle/helper text -->
            {#if isRecurring()}
              <!-- For subscription links message is different -->
              {#if isSubscription()}
                <div class="save-card-subtext">
                  {$t(SAVE_CARD_SUBTITLE_SUBSCRIPTION)}
                </div>
              {:else}
                <!-- For caw links message is different -->
                <div class="save-card-subtext">
                  {$t(RECURRING_CALLOUT)}
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

<style lang="scss">
  .secure-card-block {
    margin-left: 5 px;
    margin-top: 10 px;
  }

  .saved-card-text {
    font-size: 12px;
    line-height: 12px;
    color: #373737;
  }

  .saved-card-text-saved-card-screen {
    margin-left: 8px;
  }

  .know-more-text {
    display: block;
    font-size: 11px;
    line-height: 11px;
    margin-left: 25px;
    color: #3f71d7;
    text-decoration: underline;
    cursor: pointer;
  }

  .know-more-text-add-card {
    margin-left: 30px;
  }

  .know-more-text-saved-cards {
    top: -8px;
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

  .recurring-card-text {
    line-height: 0px;
  }
  .save_card_label_text {
    display: block;
    margin-bottom: 5px;
    float: left;
    margin-left: 30px;
  }

  .save_card_label_text.save-card-label-recurring {
    margin-bottom: 2px;
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
    width: auto;
    white-space: nowrap;
    line-height: 14px;
  }

  :global(.tooltip.subscription-flow-save-card-tooltip.tooltip-shown.tooltip-top.tooltip-right) {
    opacity: 0.9;
    width: auto;
    white-space: nowrap;
    line-height: 14px;
  }

  :global(.redesign) {
    .save_card_label_text .checkbox {
      position: relative;
      top: 2px;
    }
    .saved-card-text {
      color: var(--primary-text-color);
    }

    .know-more-text {
      color: var(--primary-color);
    }

    .p13n-block {
      margin-left: 2.5px;

      .checkbox {
        margin-right: 10px;
      }

      .know-more-text {
        margin-left: 28px;
      }
    }

    .secure-card-block-saved-cards {
      .know-more-text-saved-cards {
        margin-left: 32px;
        top: -12px;
      }
    }
  }
</style>
