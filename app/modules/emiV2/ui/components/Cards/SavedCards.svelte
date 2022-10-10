<script lang="ts">
  import { emiMethod, selectedBank } from 'emiV2/store';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { isCardTokenized } from 'ui/tabs/card/utils';
  import SavedCard from './SavedCard.svelte';
  import type { Tokens } from 'emiV2/types';
  import { t } from 'svelte-i18n';
  import { SAVED_CARDS } from 'ui/labels/card';
  import { capture, SEVERITY_LEVELS } from 'error-service';

  export let cards: Tokens[];
  const onSavedCardSelect = (token: Tokens) => {
    try {
      $selectedCard = token;
      let { card } = token;
      const coBrandingPartner: string = (card && card.cobranding_partner) || '';
      $selectedBank = {
        code: coBrandingPartner || card.issuer,
        name: coBrandingPartner || card.issuer,
      };
      $emiMethod = 'bank';
    } catch (e: any) {
      capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
    }
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
