<script>
  import { appliedOffer } from 'checkoutstore/offers';

  export let selected;
  export let offers;
  export let removeOffer;
  export let selectOffer;

  function getOfferDescription(offer) {
    // let discount = offer.original_amount - offer.amount;
    return offer.display_text;
  }
</script>

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
    padding-top: @margin-top;
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

<div role="list">
  {#each offers as offer}
    <div
      role="listitem"
      class="offer-item"
      class:selected={selected === offer}
      on:click={() => selectOffer(offer)}>
      {offer.name}
      {#if offer.emi_subvention}
        <div class="badge">No Cost EMI</div>
      {/if}
      {#if selected === offer}
        <div class="checkbox" />
        <div class="offer-detail">{getOfferDescription(offer)}</div>
        {#if offer.type === 'deferred'}
          <div class="offer-detail">
            Cashback would be credited to source mode of payment.
          </div>
        {/if}
      {/if}
      {#if $appliedOffer === offer}
        <div class="text-uppercase remove-offer" on:click={removeOffer}>
          Remove Offer
        </div>
      {/if}
    </div>
  {/each}
</div>
