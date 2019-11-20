<script>
  // UI imports
  import { afterUpdate } from 'svelte';
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Card from 'common/card';

  // Props
  export let cards = [];
  export let on = {};
  let selected = '';

  export function onViewPlans(event) {
    if (on.viewPlans) {
      on.viewPlans(event);
    }
  }

  export function handleClick(id) {
    selected = id;
  }
</script>

{#each cards as card, index (card.id)}
  <SavedCard
    card={card.card}
    debitPin={card.debitPin}
    token={card.token}
    cvvDigits={card.cvvDigits}
    plans={card.plans}
    on:click={() => {
      handleClick(card.id);
    }}
    selected={selected === card.id}
    on:viewPlans={onViewPlans} />
{/each}
