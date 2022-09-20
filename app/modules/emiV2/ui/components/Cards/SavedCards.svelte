<script lang="ts">
  import { emiMethod, selectedBank } from 'emiV2/store';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { isCardTokenized } from 'ui/tabs/card/utils';
  import SavedCard from './SavedCard.svelte';
  import type { Tokens } from 'emiV2/types';
  import { t } from 'svelte-i18n';
  import { SAVED_CARDS } from 'ui/labels/card';

  export let cards: Tokens[];
  const onSavedCardSelect = (card: Tokens) => {
    $selectedCard = card;
    $selectedBank = {
      code: card.card.issuer,
      name: card.card.issuer,
    };
    $emiMethod = 'bank';
  };
</script>

<p class="saved-card-header">
  {$t(SAVED_CARDS)}
</p>
{#each cards as card, index (card.id)}
  <SavedCard
    card={card.card}
    isTokenised={isCardTokenized(card)}
    on:select={() => {
      onSavedCardSelect(card);
    }}
    selected={($selectedCard && $selectedCard.id === card.id) || false}
  />
{/each}

<style>
  .saved-card-header {
    font-size: 13px;
    font-weight: 600;
    color: #263a4a;
    margin-bottom: 12px;
  }
</style>
