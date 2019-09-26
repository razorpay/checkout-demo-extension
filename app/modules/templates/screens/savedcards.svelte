<script>
  // UI imports
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Card from 'common/card';

  // Props
  export let cards = [];
  export let on;

  export function onViewPlans(event) {
    if (on.viewPlans) {
      on.viewPlans(event);
    }
  }
</script>

{#each cards as card (card.id)}
  <SavedCard {...card} on:viewPlans={onViewPlans} />
{/each}
