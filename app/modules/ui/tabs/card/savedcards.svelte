<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SavedCard from 'ui/tabs/card/savedcard.svelte';

  // Store
  import { selectedTokenId, savedCardEmiDuration } from 'checkoutstore/emi';
  import { getEMIBankPlans } from 'checkoutstore/methods';

  // Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Props
  export let cards = [];
  export let tab;

  const session = getSession();

  let selected = null;

  let currentCvv = '';
  let currentAuthType = '';

  const dispatch = createEventDispatcher();

  $: {
    if (selected) {
      $selectedTokenId = selected.token;
    }
  }

  export function onViewPlans(event) {
    dispatch('viewPlans', event.detail);
  }

  /**
   * TODO: comment
   * @param card
   */
  function handleOffersForSavedCard(card) {
    session.removeAutomaticallyAppliedOffer();

    // If EMI is supported on saved card
    if (session.tab === 'emi' && card.plans) {
      const issuer = card.card.issuer;
      const duration = $savedCardEmiDuration;

      // Set offer in case it is applicable.
      if (issuer && duration) {
        const plans = getEMIBankPlans(issuer);

        if (
          plans &&
          plans[duration] &&
          plans[duration].offer_id &&
          session.offers
        ) {
          session.offers.selectOfferById(plans[duration].offer_id);
        }
      }
    }
  }

  function handleClick(card, { cvv, authType }) {
    // The same card was clicked again, do nothing.
    if (selected && selected.id === card.id) {
      return;
    }

    Analytics.track('saved_card:select', {
      type: AnalyticsTypes.BEHAV,
    });

    dispatch('select', { token: card });
    currentCvv = cvv;
    currentAuthType = authType;
    selected = card;

    handleOffersForSavedCard(card);
  }

  function handleCvvChange(event) {
    currentCvv = event.detail.cvv;
  }

  function handleAuthTypeChange(event) {
    currentAuthType = event.detail.authType;
  }

  export function getSelectedToken() {
    const selectedToken = selected || {};
    const payload = { token: selectedToken.token, 'card[cvv]': currentCvv };
    if (currentAuthType) {
      payload.auth_type = currentAuthType;
    }
    if ($savedCardEmiDuration) {
      payload.emi_duration = $savedCardEmiDuration;
    }
    return payload;
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
    selected={selected && selected.id === card.id}
    on:viewPlans={onViewPlans} />
{/each}
