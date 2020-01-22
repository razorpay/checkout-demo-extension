<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import SavedCard from 'templates/views/savedcard.svelte';

  // Store
  import { selectedTokenId, savedCardEmiDuration } from 'checkoutstore/emi';

  // Props
  export let cards = [];
  export let tab;

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

  function handleClick(card, { cvv, authType }) {
    dispatch('select', { token: card });
    currentCvv = cvv;
    currentAuthType = authType;
    selected = card;
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
