<script>
  // Declarations and Import Statements
  import SecureCardKnowMore from './SecureCardKnowMore.svelte';
  import { t } from 'svelte-i18n';
  import { onMount, onDestroy } from 'svelte';
  import Razorpay from 'common/Razorpay';
  import { Events, CardEvents } from 'analytics/index';
  import { defaultUserConsentForTokenization } from 'checkoutstore/screens/card';
  let secureCardKnowMoreView;

  //i18n
  import {
    SAVE_CARD_TEXT,
    KNOW_MORE,
    SAVE_CARD_TEXT_NEW_CARD,
  } from 'ui/labels/card';

  // Export statements
  export let checked;
  export let savedcard;
  export let modalType;
  export let name = 'save';
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
    if (network && network.toLowerCase() === 'visa') {
      checked = false;
    }
  });
  onDestroy(() => {
    if (network && network.toLowerCase() === 'visa') {
      checked = defaultUserConsentForTokenization;
    }
  });
</script>

<div
  class="secure-card-block"
  class:secure-card-block-saved-cards={Boolean(savedcard)}
>
  <!-- do not modify the id of label tag, this id has a multiple bug fixes in session -->
  <label class="first" for={name} id="should-save-card" tabIndex="0">
    <input
      type="checkbox"
      class="checkbox--square"
      id={name}
      value="1"
      on:focus
      on:change={trackUserConsentForTokenization}
      on:change
      bind:checked
      {name}
    />
    <span class="checkbox" />
    <!-- LABEL: Keep card saved for future payments -->
    <span
      class="saved-card-text"
      class:saved-card-text-saved-card-screen={Boolean(savedcard)}
    >
      {#if modalType === 'add-new-card'}
        {$t(SAVE_CARD_TEXT_NEW_CARD)}
      {:else}
        {$t(SAVE_CARD_TEXT)}
      {/if}</span
    >
  </label>
  <span
    class="know-more-text"
    class:know-more-text-saved-cards={Boolean(savedcard)}
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

  .saved-card-text-saved-card-screen {
    margin-left: 5px;
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
</style>
