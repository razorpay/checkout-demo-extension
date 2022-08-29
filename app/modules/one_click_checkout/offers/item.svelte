<script lang="ts">
  // util imports
  import { appliedOffer } from 'offers/store';
  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    NO_COST_EMI,
    CASHBACK_DETAIL,
    REMOVE_ACTION,
  } from 'ui/labels/offers';

  export let selected;
  export let offers;
  export let offer;
  export let offerIndex;
  export let removeOffer;
  export let selectOffer;
  export let getOfferDescription;

  function handleRemoveOffer(event) {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }
    removeOffer();
  }
</script>

<div
  role="listitem"
  class="offer-item"
  class:selected={selected === offer}
  class:first-item={offerIndex === 0}
  class:last-item={offers?.length === offerIndex + 1}
  on:click={() => {
    selectOffer(offer);
  }}
>
  <div class="offer-heading">
    <div class="heading-text">
      {offer.name}
    </div>
    <div class="offer-badge">
      {#if offer.emi_subvention}
        <!-- LABEL: No Cost EMI -->
        <div class="badge">
          {$t(NO_COST_EMI)}
        </div>
      {/if}
      <div class="checkbox" class:inactive={selected !== offer} />
    </div>
  </div>
  {#if selected === offer}
    <div class="available-offers">
      {#if getOfferDescription(offer)}
        <!-- Only show the description if offer description is set. -->
        <div class="offer-detail">{getOfferDescription(offer)}</div>
      {/if}
      {#if offer.type === 'deferred'}
        <!-- LABEL: Cashback would be credited to source mode of payment. -->
        <div class="offer-detail">{$t(CASHBACK_DETAIL)}</div>
      {/if}
    </div>
  {/if}
  {#if $appliedOffer === offer}
    <!-- LABEL: Remove Offer -->
    <div class="text-uppercase remove-offer" on:click={handleRemoveOffer}>
      {$t(REMOVE_ACTION)}
    </div>
  {/if}
</div>

<style>
  .offer-item {
    margin: -1px 12px 0;
    background: #fff;
    border: 1px solid var(--light-dark-color);
    padding: 14px 16px;
    cursor: pointer;
    line-height: 18px;
  }
  .list .offer-heading .checkbox:after {
    border-color: #fff;
  }
  .list .offer-heading .inactive.checkbox:after {
    border-color: var(--light-dark-color);
  }
  .inactive.checkbox {
    background: #fff;
    border-color: var(--light-dark-color) !important;
  }
  .offer-item.selected {
    position: relative;
  }
  .offer-badge {
    display: flex;
    align-items: center;
  }
  .offer-detail {
    border-top: 1px solid var(--light-dark-color);
    color: var(--secondary-text-color);
    font-size: var(--font-size-body);
    padding: 8px 0px;
  }
  .remove-offer {
    margin-top: 12px;
    text-transform: capitalize;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.5px;
    cursor: pointer;
  }
  .badge {
    padding: 2px 4px;
    background-color: #e5faed;
    color: var(--positive-text-color);
    pointer-events: none;
    font-size: var(--font-size-tiny);
    margin-right: 10px;
    border-radius: 2px;
    font-weight: var(--font-weight-semibold);
  }
  .offer-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .heading-text {
    width: 64%;
    font-weight: var(--font-weight-semibold);
  }
  .first-item {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .last-item {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .checkbox {
    margin-top: 2px;
  }

  .available-offers {
    margin-top: 10px;
  }
  .offer-item .offer-detail:last-child {
    padding-bottom: 0px;
  }
</style>
