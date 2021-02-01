<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SavedCard from 'ui/tabs/card/savedcard.svelte';

  // Store
  import { selectedTokenId, savedCardEmiDuration } from 'checkoutstore/emi';

  import {
    selectedCard,
    currentAuthType,
    currentCvv,
  } from 'checkoutstore/screens/card';

  // Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardMetadata } from 'common/card';

  // Props
  export let cards = [];
  export let tab;

  const session = getSession();

  $selectedCard = null; // Refresh selection when landing again

  const dispatch = createEventDispatcher();

  $: {
    if ($selectedCard) {
      $selectedTokenId = $selectedCard.token;
    }
  }

  export function onViewPlans(event) {
    dispatch('viewPlans', event.detail);
  }

  function handleClick(card, { cvv, authType }) {
    // The same card was clicked again, do nothing.
    if ($selectedCard && $selectedCard.id === card.id) {
      return;
    }

    Analytics.track('saved_card:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        card: getCardMetadata(card.id),
      },
    });

    dispatch('select', { token: card });
    $currentCvv = cvv;
    $currentAuthType = authType;
    $selectedCard = card;
  }

  function handleCvvChange(event) {
    $currentCvv = event.detail.cvv;
  }

  function handleAuthTypeChange(event) {
    $currentAuthType = event.detail.authType;
  }
</script>

{#each cards as card, index (card.id)}
  <SavedCard
    card={card.card}
    debitPin={card.debitPin}
    token={card.token}
    cvvDigits={card.cvvDigits}
    plans={card.plans}
    {tab}
    on:click={event => {
      handleClick(card, event.detail);
    }}
    on:cvvchange={handleCvvChange}
    on:authtypechange={handleAuthTypeChange}
    selected={$selectedCard && $selectedCard.id === card.id}
    on:viewPlans={onViewPlans} />
{/each}
