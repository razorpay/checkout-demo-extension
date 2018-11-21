{#each cards as card}
  <SavedCard
    {card}
  />
{/each}

<script>
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Card from 'common/card';

  export default {
    components: {
      SavedCard,
    },
  }
</script>
