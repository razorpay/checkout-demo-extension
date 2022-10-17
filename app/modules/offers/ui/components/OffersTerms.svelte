<script lang="ts">
  import * as TermsCurtain from 'checkoutframe/termscurtain';
  import { TERMS_CONDITION_LABEL } from 'one_click_checkout/coupons/i18n/labels';
  import { t } from 'svelte-i18n';

  export let offer: Offers.OfferItem;

  function handleShowOfferTerms(offer: Offers.OfferItem) {
    TermsCurtain.show({
      terms: offer.terms,
    });
  }
</script>

{#if offer.terms}
  <!-- LABEL: Terms & Conditions -->
  <div
    class="theme-highlight offer-terms-conditions"
    on:click={handleShowOfferTerms(offer)}
  >
    {$t(TERMS_CONDITION_LABEL)}
  </div>
{/if}

<style>
  .offer-terms-conditions {
    margin-top: 4px;
  }
</style>
