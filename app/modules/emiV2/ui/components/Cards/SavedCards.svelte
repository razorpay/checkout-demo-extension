<script lang="ts">
  import { emiMethod, selectedBank } from 'emiV2/store';
  import { selectedCard } from 'checkoutstore/screens/card';
  import { isCardTokenized } from 'ui/tabs/card/utils';
  import SavedCard from './SavedCard.svelte';
  import type { Tokens } from 'emiV2/types';
  import { t } from 'svelte-i18n';
  import { SAVED_CARDS } from 'ui/labels/card';
  import { capture, SEVERITY_LEVELS } from 'error-service';
  import { getSession } from 'sessionmanager';

  export let cards: Tokens[];

  const session = getSession();
  const onSavedCardSelect = (token: Tokens) => {
    try {
      let { card } = token;
      const coBrandingPartner: string = (card && card.cobranding_partner) || '';
      let offerError = false;
      // If a bank emi offer is applied we only validate offer for card without cobranding
      // Since for co branding cards only bin based offer work
      if (card.issuer && !coBrandingPartner) {
        offerError = !session.validateOffers(
          card.issuer,
          function (removedOffer) {
            if (removedOffer) {
              $selectedCard = token;
              $selectedBank = {
                code: card.issuer,
                name: card.issuer,
              };
              $emiMethod = 'bank';
            }
          }
        );
      }

      if (!offerError) {
        $selectedCard = token;
        $selectedBank = {
          code: coBrandingPartner || card.issuer,
          name: coBrandingPartner || card.issuer,
        };
        $emiMethod = 'bank';
      }
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
