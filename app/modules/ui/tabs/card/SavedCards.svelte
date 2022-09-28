<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SavedCard from 'ui/tabs/card/SavedCard.svelte';

  // Store
  import { selectedTokenId } from 'checkoutstore/emi';

  import {
    selectedCard,
    currentAuthType,
    currentCvv,
    showSavedCardTooltip,
  } from 'checkoutstore/screens/card';

  // Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardMetadata } from 'common/card';

  import { isCardTokenized } from './utils';
  import { writable, Writable } from 'svelte/store';
  import { getInstrumentsWithOrder } from 'common/helper';
  import { MiscTracker } from 'misc/analytics/events';
  import { AnalyticsV2State } from 'analytics-v2';
  import { CardsTracker } from 'card/analytics/events';
  // Props
  export let cards = [];
  export let tab;

  export let isFormValid = false;

  let savedCardValidation: Writable<Record<string, boolean>> = writable({});

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

    /**
     * IMPORTANT NOTE
     * Please don't the showSavedCardTooltip = false statement after dispatch
     * It creates wierd bug in saved card flow, in which multiple cards remain selected
     */
    $showSavedCardTooltip = false;
    Analytics.track('saved_card:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        card: getCardMetadata(card.id),
      },
    });
    try {
      CardsTracker.GEN_SAVED_CARD_SELECTED();
      MiscTracker.INSTRUMENT_SELECTED({
        block: AnalyticsV2State.selectedBlock,
        method: {
          name: 'card',
        },
        instrument: {
          issuer: getCardMetadata(card.id)?.issuer,
          saved: true,
          personalisation: false,
          network: getCardMetadata(card.id)?.network,
          type: getCardMetadata(card.id)?.type,
        },
      });
    } catch {}

    dispatch('select', { token: card });
    $currentCvv = cvv;
    $currentAuthType = authType;
    $selectedCard = card;
    isFormValid = $savedCardValidation[card.id] ?? true;
  }

  function handleCvvChange(event) {
    $currentCvv = event.detail.cvv;
  }

  $: {
    isFormValid = $savedCardValidation[$selectedCard?.id] ?? true;
  }

  function handleAuthTypeChange(event) {
    $currentAuthType = event.detail.authType;
  }

  $: {
    try {
      if (tab === 'card' || tab === 'emi') {
        MiscTracker.INSTRUMENTATION_SELECTION_SCREEN({
          block: AnalyticsV2State.selectedBlock,
          method: {
            name: tab,
          },
          instruments: getInstrumentsWithOrder(cards, 'cards'),
        });
      }
    } catch {}
  }
</script>

{#each cards as card (card.id)}
  <SavedCard
    card={card.card}
    isTokenised={isCardTokenized(card)}
    debitPin={card.debitPin}
    token={card.token}
    cvvDigits={card.cvvDigits}
    plans={card.plans}
    {tab}
    bind:isFormValid={$savedCardValidation[card.id]}
    on:click={(event) => {
      handleClick(card, event.detail);
    }}
    on:cvvchange={handleCvvChange}
    on:authtypechange={handleAuthTypeChange}
    selected={$selectedCard && $selectedCard.id === card.id}
    on:viewPlans={onViewPlans}
  />
{/each}
