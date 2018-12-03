{#each cards as card}
  <SavedCard
    {...card}

    on:viewPlans="onViewPlans(event)"
  />
{/each}

<script>
  import SavedCard from 'templates/views/savedcard.svelte';
  import * as Card from 'common/card';

  export default {
    computed: {
      cards: ({ cards }) => {
        return cards.filter(token => token.method === 'card');
      },
    },

    components: {
      SavedCard,
    },

    methods: {
      onViewPlans: function (event) {
        const {
          on = {}
        } = this.get();

        if (on.viewPlans) {
          on.viewPlans(event);
        }
      }
    },
  }
</script>
