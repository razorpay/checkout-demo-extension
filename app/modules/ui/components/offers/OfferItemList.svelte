<script lang="ts">
  // UI imports
  import OfferItemMagicCheckout from 'one_click_checkout/offers/item.svelte';
  // util imports
  import { appliedOffer } from 'offers/store';
  import { isRedesignV15 } from 'razorpay';
  // i18n
  import { t } from 'svelte-i18n';
  import {
    NO_COST_EMI,
    CASHBACK_DETAIL,
    REMOVE_ACTION,
  } from 'ui/labels/offers';
  import OffersTerms from 'offers/ui/components/OffersTerms.svelte';
  export let selected;
  export let offers;
  export let removeOffer;
  export let selectOffer;
  function getOfferDescription(offer) {
    // let discount = offer.original_amount - offer.amount;
    return offer.display_text;
  }

  function handleRemoveOffer(event) {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    removeOffer();
  }
</script>

<div role="list" class="offers-list">
  {#each offers as offer, index (offer.id)}
    {#if isRedesignV15()}
      <OfferItemMagicCheckout
        {selected}
        {offers}
        {offer}
        {removeOffer}
        {selectOffer}
        {getOfferDescription}
        offerIndex={index}
      />
    {:else}
      <div
        role="listitem"
        class="offer-item"
        class:selected={selected === offer}
        on:click={() => {
          selectOffer(offer);
        }}
      >
        {offer.name}
        {#if offer.emi_subvention}
          <!-- LABEL: No Cost EMI -->
          <div class="badge">
            {$t(NO_COST_EMI)}
          </div>
        {/if}
        {#if selected === offer}
          <div class="checkbox" />
          {#if getOfferDescription(offer)}
            <!-- Only show the description if offer description is set. -->
            <div class="offer-detail">{getOfferDescription(offer)}</div>
          {/if}
          <!-- Offers Terms -->
          <OffersTerms {offer} />
          {#if offer.type === 'deferred'}
            <!-- LABEL: Cashback would be credited to source mode of payment. -->
            <div class="offer-detail">{$t(CASHBACK_DETAIL)}</div>
          {/if}
        {/if}
        {#if $appliedOffer === offer}
          <!-- LABEL: Remove Offer -->
          <div class="text-uppercase remove-offer" on:click={handleRemoveOffer}>
            {$t(REMOVE_ACTION)}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .offer-item {
    margin: -1px 12px 0;
    background: #fff;
    border: 1px solid #e6e7e8;
    padding: 14px 16px;
    cursor: pointer;
    line-height: 18px;
  }
  .checkbox {
    position: absolute;
    right: 16px;
    top: 12px;
  }
  .checkbox:after {
    border-color: #fff !important;
  }
  .offer-item.selected {
    position: relative;
  }
  .offer-detail {
    border-top: 1px solid #e6e7e8;
    color: #666;
    font-size: 13px;
    margin-top: 14px;
    padding-top: 14px;
  }
  .remove-offer {
    margin-top: 12px;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.5px;
    cursor: pointer;
  }
  .badge {
    display: inline-block;
    margin: 0 8px;
    border: 1px solid #70be53;
    border-radius: 2px;
    background-color: #f7fbf5;
    color: #70be53;
    font-size: 10px;
    padding: 0 3px;
    text-transform: uppercase;
    pointer-events: none;
  }
</style>
