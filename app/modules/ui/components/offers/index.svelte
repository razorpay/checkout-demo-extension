<script>
  import { fly } from 'svelte/transition';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency } from 'checkoutstore';
  import {
    getOffersForTab,
    getOffersForInstrument,
    getOtherOffers,
  } from 'checkoutframe/offers';

  import Callout from 'ui/elements/Callout.svelte';
  import CTA from 'ui/elements/CTA.svelte';
  import OfferItemList from './OfferItemList.svelte';

  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { appliedOffer, isCardValidForOffer } from 'checkoutstore/offers';
  import { customer } from 'checkoutstore/customer';

  export let applicableOffers; // eligible offers array
  export let setAppliedOffer;
  export let onShown;

  let listActive;
  let otherActive;
  let selected = null; // locally selected offer
  let error;
  let errorCb;
  let otherOffers = [];
  let discount;
  let previousApplied = {};
  let currentTab;

  $: {
    _El.keepClass(_Doc.querySelector('#header'), 'offer-fade', listActive);
    if (!listActive) {
      otherActive = false;
    }
  }
  $: _El.keepClass(_Doc.querySelector('#header'), 'offer-error', error);
  $: switchInstrument($selectedInstrument);

  $: discount =
    $appliedOffer && $appliedOffer.original_amount - $appliedOffer.amount;

  $: $isCardValidForOffer, setAppliedOffer($appliedOffer);

  function switchInstrument() {
    if (!currentTab) {
      renderTab();
    }
  }

  export function renderTab(tab) {
    if (tab !== currentTab) {
      currentTab = tab;
    }
    if (!tab && $selectedInstrument) {
      tab = $selectedInstrument.method;
      applicableOffers = getOffersForInstrument($selectedInstrument);
    } else {
      applicableOffers = getOffersForTab(tab);
    }

    var invalidateOffer = false;
    // restore previously selected offer for same payment method
    if (previousApplied[tab]) {
      $appliedOffer = previousApplied[tab];
      invalidateOffer = true;
    }
    otherOffers = getOtherOffers(applicableOffers);
    if ($appliedOffer && !_Arr.contains(applicableOffers, $appliedOffer)) {
      selected = $appliedOffer = null;
      invalidateOffer = true;
    }
    if (invalidateOffer) {
      setAppliedOffer($appliedOffer);
    }
  }

  export function getAppliedOffer() {
    return $appliedOffer;
  }

  export function isCardApplicable() {
    return $isCardValidForOffer;
  }

  export function shouldSendOfferToApi() {
    return $appliedOffer.provider !== 'zestmoney' && $isCardValidForOffer;
  }

  export function showError(description, cb) {
    error = description;
    errorCb = cb;
  }

  function hideError(withOffer) {
    error = null;
    if (!withOffer) {
      removeOffer();
    }
    if (errorCb) {
      errorCb(!withOffer);
      errorCb = null;
    }
  }

  function continueWithoutOffer() {
    hideError();
  }

  function continueWithOffer() {
    hideError(true);
  }

  function showList() {
    listActive = true;

    // select the applied offer
    if ($appliedOffer) {
      selected = $appliedOffer;
    }

    onShown();
  }

  function hideList() {
    listActive = false;
    selected = null;
  }

  export function isListShown() {
    return listActive;
  }

  export function onSubmit() {
    applyOffer(selected);
  }

  function applyOffer(offer) {
    $appliedOffer = offer;
    if (offer) {
      previousApplied[offer.payment_method] = offer;
    }
    // you hide offers view first, to initiate CTA unmount lifecycle
    hideList();
    // let other view updation take place after offers hide
    // to maintain CTA lifo stack
    setAppliedOffer(offer, true);
  }

  export function clearOffer() {
    applyOffer(null);
  }

  function removeOffer() {
    if ($appliedOffer) {
      delete previousApplied[$appliedOffer.payment_method];
    }
    clearOffer();
  }

  function selectOffer(offer) {
    selected = offer;
  }
</script>

<style>
  header {
    padding: 0 20px;
    cursor: pointer;
    flex: 0 0 44px;
    height: 44px;
    line-height: 40px;
    display: flex;
    border-radius: 0 0 2px 2px;
  }
  header.applied {
    background: #effcf4;
  }
  .offers-container[hidden] {
    display: none;
  }
  .offers-container.has-error:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
  header span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  header:before {
    content: '\e717';
    font-size: 18px;
    margin: -1px 8px 0 0;
  }
  header:after {
    content: '\e601';
    transform: rotate(180deg);
    margin-left: auto;
    font-size: 20px;
  }
  .offer-action {
    float: right;
    margin-right: 4px;
  }
  main {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 3;
    background: #f7f7f7;
    margin-bottom: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
  .offerlist-container {
    overflow: auto;
    flex: 1;
    padding-bottom: 14px;
  }
  .close-offerlist {
    line-height: 44px;
    padding: 0 20px;
    cursor: pointer;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .close-offerlist span {
    text-align: right;
    margin-right: 4px;
  }
  .close-offerlist:before {
    content: '\e717';
    font-size: 18px;
    margin-right: 8px;
  }
  .close-offerlist:after {
    margin-top: -2px;
    transform: none;
  }
  .error-container {
    position: absolute;
    z-index: 1;
    background: #fff;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
    bottom: 0;
    right: 0;
    left: 0;
  }
  .error-desc {
    padding: 16px 24px;
    border-bottom: 1px solid #ddd;
    color: #414141;
  }
  .error-btns {
    padding: 16px 0;
  }
  .error-btns span {
    margin-left: 20px;
    padding: 0 4px;
    cursor: pointer;
  }
  legend {
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.25px;
    color: #666;
    padding: 12px 14px 6px;
  }
  legend small {
    text-transform: none;
    font-size: inherit;
  }
  legend span {
    cursor: pointer;
  }
</style>

<div
  class="offers-container"
  id="offers-container"
  hidden={applicableOffers.length + otherOffers.length === 0}
  class:has-error={error}>
  <header
    on:click={showList}
    class:applied={$appliedOffer && $isCardValidForOffer}>
    <span>
      {#if $appliedOffer}
        {#if !$isCardValidForOffer}
          Offer is not applicable on this card.
        {:else}
          Offer Applied!
          {#if discount}
            <small class="theme-highlight">
              You save {formatAmountWithSymbol(discount, getCurrency(), false)}
            </small>
          {/if}
        {/if}
      {:else if applicableOffers.length === 1}
        {applicableOffers[0].name}
      {:else}
        {applicableOffers.length + otherOffers.length} Offers Available
      {/if}
      <span class="offer-action theme-highlight">
        {$appliedOffer ? 'Change' : 'Select'}
      </span>
    </span>
  </header>
  {#if error}
    <div class="error-container">
      <div class="error-desc">
        <b>The offer is not applicable on {error}.</b>
        <br />
        <span>You can pay the original amount.</span>
      </div>
      <div class="error-btns theme-highlight">
        <span on:click={continueWithoutOffer}>
          <b>Continue without offer</b>
        </span>
        <span class="error-back" on:click={continueWithOffer}>Back</span>
      </div>
    </div>
  {/if}
  {#if listActive}
    <main class="list" transition:fly={{ y: 40, duration: 200 }}>
      <header class="close-offerlist" on:click={hideList}>
        Select an offer
        <span>Hide</span>
      </header>
      <div class="offerlist-container">
        {#if applicableOffers.length}
          <legend>Available Offers</legend>
          <OfferItemList
            {selected}
            offers={applicableOffers}
            {removeOffer}
            {selectOffer} />
        {:else}
          <legend>
            <small>
              No offers available for this method. Please look at other offers
              available below
            </small>
          </legend>
        {/if}
        {#if otherOffers.length}
          {#if otherActive || !applicableOffers.length}
            {#if otherActive}
              <legend>Other Offers</legend>
            {/if}
            <OfferItemList
              {selected}
              offers={otherOffers}
              {removeOffer}
              {selectOffer} />
          {:else}
            <legend>
              <span
                class="theme-highlight"
                on:click={() => (otherActive = true)}>
                + OTHER OFFERS
                <small>({otherOffers.length} more)</small>
              </span>
            </legend>
          {/if}
        {/if}
      </div>
    </main>
  {/if}
</div>
{#if error}
  <CTA show={false} />
{:else if listActive}
  <CTA on:click={onSubmit} show={Boolean(selected)}>Apply Offer</CTA>
{/if}
