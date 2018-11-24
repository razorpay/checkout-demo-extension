{#each cards as card}
  <SavedCard
    {card}
  />
{/each}

<script>
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Card from 'common/card';

  export default {
    computed: {
      cards: ({ $Customer }) => {
        const {
          tokens
        } = $Customer;

        if (!tokens) {
          return [];
        }

        // TODO: Also check for current payment method.
        return tokens.filter(token => token.method === 'card');
      },
    },

    components: {
      SavedCard,
    },
  }
</script>
