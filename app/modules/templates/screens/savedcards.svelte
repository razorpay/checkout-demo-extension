<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SavedCard from 'templates/views/savedcard.svelte';

  // Store
  import { selectedTokenId, savedCardEmiDuration } from 'checkoutstore/emi';

  // Utils
  import { getSession } from 'sessionmanager';

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
    if (session.offers && !session.offers.offerSelectedByDrawer) {
      session.offers.removeOffer();
    }

    // If EMI is supported on saved card
    if (session.tab === 'emi' && card.plans) {
      var issuer = card.card.issuer;
      var duration = savedCardEmiDuration;

      // Set offer in case it is applicable.
      if (issuer && duration) {
        var emi_options = this.emi_options;
        var plans = (emi_options.banks[issuer] || {}).plans;

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
