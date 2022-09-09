<script lang="ts">
  import { tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency, isEmiV2, isRedesignV15 } from 'razorpay';
  import { getAnimationOptions } from 'svelte-utils';
  import { CRED_EXPERIMENTAL_OFFER_ID } from 'checkoutframe/cred';
  import { CredEvents, OfferEvents, Events } from 'analytics/index';
  import { EVENTS as ONE_CC_EVENTS } from 'analytics/offers/events';

  import * as _El from 'utils/DOM';
  import {
    getOffersForTab,
    getOffersForInstrument,
    getOtherOffers,
    getOffersForTabAndInstrument,
    filterNoCostEmiOffers,
  } from 'checkoutframe/offers';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import {
    AVAILABLE_OFFERS_HEADER,
    BACK_ACTION,
    CHANGE_ACTION,
    CONTINUE_WITHOUT_OFFER_ACTION,
    HIDE_ACTION,
    NO_OFFER_AVAILABLE_METHOD_MESSAGE,
    NOT_APPLICABLE_ERROR,
    NOT_APPLICABLE_CARD_MESSAGE,
    OFFER_APPLIED_MESSAGE,
    OFFERS_AVAILABLE_MESSAGE,
    OTHER_OFFERS_ACTION,
    OTHER_OFFERS_COUNT,
    OTHER_OFFERS_HEADER,
    PAY_ORIGINAL_MESSAGE,
    SELECT_ACTION,
    SELECT_OFFER_HEADER,
    YOU_SAVE_MESSAGE,
    APPLY_OFFER_CTA,
    YOU_APPLIED_NO_COST,
  } from 'ui/labels/offers';

  import CTA from 'ui/elements/CTA.svelte';
  import OfferItemList from './OfferItemList.svelte';
  import {
    selectedInstrument,
    methodInstrument,
  } from 'checkoutstore/screens/home';
  import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
  import {
    appliedOffer,
    isCardValidForOffer,
    offerWindowOpen,
    showOffers,
  } from 'offers/store/store';
  import { querySelector } from 'utils/doc';
  import { getSession } from 'sessionmanager';

  export let applicableOffers: Offers.OffersList; // eligible offers array
  export let setAppliedOffer;
  export let onShown;
  export let onHide;

  let listActive: boolean;
  let otherActive;
  let selected = null; // locally selected offer
  let error;
  let errorCb;
  let otherOffers: Offers.OffersList = [];
  let discount;
  let previousApplied = {};
  let currentTab;

  let OfferCTAState = {
    show: false,
    disabled: true,
  };

  const isRedesignV15Enabled = isRedesignV15();

  $: {
    _El.keepClass(querySelector('#header'), 'offer-fade', listActive);
    if (!listActive) {
      otherActive = false;
    }
  }
  $: _El.keepClass(querySelector('#header'), 'offer-error', error);

  $: $selectedInstrument, switchInstrument();

  $: discount =
    $appliedOffer && $appliedOffer.original_amount - $appliedOffer.amount;

  $: $isCardValidForOffer, setAppliedOffer($appliedOffer);

  function switchInstrument() {
    if (!currentTab) {
      renderTab();
    }
  }

  export function rerenderTab() {
    renderTab(currentTab);
  }

  export function renderTab(tab) {
    if (tab !== currentTab) {
      currentTab = tab;
    }

    if (!tab) {
      // Homescreen

      if ($selectedInstrument) {
        // Instrument is selected, show offers for that instrument
        tab = $selectedInstrument.method;
        applicableOffers = getOffersForInstrument($selectedInstrument);
      } else {
        // No instrument is selected, show all offers for homescreen
        applicableOffers = getOffersForTab();
      }
    } else {
      // We are in a method tab. Instrument might have been chosen. Show offers accordingly.
      applicableOffers = getOffersForTabAndInstrument({
        tab,
        instrument: $methodInstrument,
      });
    }

    let invalidateOffer = false;
    // restore previously selected offer for same payment method
    if (previousApplied[tab]) {
      $appliedOffer = previousApplied[tab];
      invalidateOffer = true;
    }
    otherOffers = getOtherOffers(applicableOffers);
    if ($appliedOffer && !applicableOffers.includes($appliedOffer)) {
      selected = $appliedOffer = null;
      invalidateOffer = true;
    }
    if (invalidateOffer) {
      setAppliedOffer($appliedOffer);
    }

    // filter out no cost emi offers if new emi flow is present
    if (isEmiV2()) {
      applicableOffers = filterNoCostEmiOffers(applicableOffers);
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
    // If applied offer is no cost emi offer
    // And belongs to new emi flow we don't allow the click

    if (isNoCostOfferApplied) {
      return;
    }

    listActive = true;
    $offerWindowOpen = true;

    // select the applied offer
    if ($appliedOffer) {
      selected = $appliedOffer;
    }
    if (isRedesignV15Enabled) {
      const headerMagicCheckout = document.querySelector('#header-1cc');
      headerMagicCheckout.classList.add('offers-fade');
    }
    onShown();
  }

  function hideList(shouldMountCta) {
    listActive = false;
    $offerWindowOpen = false;
    selected = null;

    // onHide basically mounts the active screen's cta..don't do it in edge cases. (When going back from home screen)
    if (shouldMountCta) {
      onHide();
    }
    if (isRedesignV15Enabled) {
      const headerMagicCheckout = document.querySelector('#header-1cc');
      headerMagicCheckout.classList.remove('offers-fade');
    }
  }

  export function isListShown() {
    return listActive;
  }

  export function onSubmit() {
    applyOffer(selected, true);
  }

  function applyOffer(offer, shouldMountCta) {
    Events.TrackBehav(OfferEvents.APPLY, { offer });
    if (offer && offer.id === CRED_EXPERIMENTAL_OFFER_ID) {
      Events.TrackBehav(CredEvents.EXPERIMENT_OFFER_SELECTED);
    }
    $appliedOffer = offer;
    if (offer) {
      previousApplied[offer.payment_method] = offer;
    }
    // you hide offers view first, to initiate CTA unmount lifecycle
    hideList(shouldMountCta);
    // let other view updation take place after offers hide
    // to maintain CTA lifo stack
    $shouldOverrideVisibleState = false;
    tick().then(() => setAppliedOffer(offer, true));
  }

  export function clearOffer(shouldMountCta = true) {
    applyOffer(null, shouldMountCta);
    selected = null;
  }

  function removeOffer() {
    if ($appliedOffer) {
      delete previousApplied[$appliedOffer.payment_method];
    }
    clearOffer();
  }

  function selectOffer(offer) {
    Events.TrackBehav(ONE_CC_EVENTS.OFFERS_CLICKED, {
      offer: {
        id: offer.id,
        type: offer.type,
        method: offer.payment_method,
      },
    });
    selected = offer;
  }

  function onCloseClick() {
    Events.TrackBehav(ONE_CC_EVENTS.OFFERS_DISMISSED);
    hideList(true);
  }

  $: {
    if (isRedesignV15Enabled && listActive) {
      OfferCTAState.disabled = error || !selected;
    }
  }

  let isNoCostOfferApplied = false;

  $: {
    isNoCostOfferApplied =
      isEmiV2() && $appliedOffer && $appliedOffer.emi_subvention ? true : false;
  }

  const session = getSession();
</script>

{#if $showOffers}
  <div
    class="offers-container"
    id="offers-container"
    hidden={applicableOffers.length + otherOffers.length === 0 &&
      !$appliedOffer}
    class:has-error={error}
    class:offers-container-checkout-redesign={isRedesignV15Enabled}
  >
    <header
      on:click={showList}
      class:applied={$appliedOffer && $isCardValidForOffer}
      class:offer-nc-applied={isNoCostOfferApplied}
    >
      <span class:bold={isRedesignV15Enabled}>
        {#if $appliedOffer}
          {#if !$isCardValidForOffer}
            <!-- LABEL: Offer is not applicable on this card. -->
            {$t(NOT_APPLICABLE_CARD_MESSAGE)}
          {:else}
            <!-- LABEL: Offer Applied! -->
            {$t(OFFER_APPLIED_MESSAGE)}
            {#if discount}
              <small class="theme-highlight">
                <!-- LABEL: You save {amount} -->
                {formatTemplateWithLocale(
                  YOU_SAVE_MESSAGE,
                  {
                    amount: formatAmountWithSymbol(
                      discount,
                      getCurrency(),
                      false
                    ),
                  },
                  $locale
                )}
              </small>
            {:else if isNoCostOfferApplied}
              <small class="theme-highlight">
                <!-- LABEL: You applied no cost emi -->
                {$t(YOU_APPLIED_NO_COST)}
              </small>
            {/if}
          {/if}
        {:else if applicableOffers.length === 1}
          {applicableOffers[0].name}
        {:else}
          <!-- LABEL: {count} Offers Available -->
          {formatTemplateWithLocale(
            OFFERS_AVAILABLE_MESSAGE,
            { count: applicableOffers.length + otherOffers.length },
            $locale
          )}
        {/if}
        {#if !isNoCostOfferApplied}
          <span class="offer-action theme-highlight">
            <!-- LABEL: Change / Select -->
            {$appliedOffer ? $t(CHANGE_ACTION) : $t(SELECT_ACTION)}
          </span>
        {/if}
      </span>
    </header>
    {#if error}
      <div
        class="error-container"
        class:checout-redesign={isRedesignV15Enabled}
      >
        <div class="error-desc">
          <!-- LABEL: The offer is not applicable on {error}. -->
          <b>
            {formatTemplateWithLocale(NOT_APPLICABLE_ERROR, { error }, $locale)}
          </b>
          <br />
          <!-- LABEL: You can pay the original amount. -->
          <span>{$t(PAY_ORIGINAL_MESSAGE)}</span>
        </div>
        <div class="error-btns theme-highlight">
          <span on:click={continueWithoutOffer}>
            <!-- LABEL: Continue without offer -->
            <b>{$t(CONTINUE_WITHOUT_OFFER_ACTION)}</b>
          </span>
          <!-- LABEL: Back -->
          <span class="error-back" on:click={continueWithOffer}>
            {$t(BACK_ACTION)}
          </span>
        </div>
      </div>
    {/if}
    {#if listActive}
      <main
        class="list"
        class:main-checkout-redesign={isRedesignV15Enabled}
        class:main-checkout-emi={isEmiV2() && session.tab === 'emi'}
        transition:fly|local={getAnimationOptions({ y: 40, duration: 200 })}
      >
        <header class="close-offerlist" on:click={onCloseClick}>
          <!-- LABEL: Select an offer -->
          {$t(SELECT_OFFER_HEADER)}
          <!-- LABEL: Hide -->
          <span>{$t(HIDE_ACTION)}</span>
        </header>
        <div
          class="offerlist-container"
          class:offerlist-checkout-redesign={isRedesignV15Enabled}
        >
          {#if applicableOffers.length}
            <!-- LABEL: Available Offers -->
            <legend class:checkout-redesign-label={isRedesignV15Enabled}
              >{$t(AVAILABLE_OFFERS_HEADER)}</legend
            >
            <OfferItemList
              {selected}
              offers={applicableOffers}
              {removeOffer}
              {selectOffer}
            />
          {:else}
            <legend class:checkout-redesign-label={isRedesignV15Enabled}>
              <!-- LABEL: No offers available for this method. Please look at other offers
              available below -->
              <small>{$t(NO_OFFER_AVAILABLE_METHOD_MESSAGE)}</small>
            </legend>
          {/if}
          {#if otherOffers.length}
            {#if otherActive || !applicableOffers.length}
              {#if otherActive}
                <!-- LABEL: Other Offers -->
                <legend class:checkout-redesign-label={isRedesignV15Enabled}
                  >{$t(OTHER_OFFERS_HEADER)}</legend
                >
              {/if}
              <OfferItemList
                {selected}
                offers={otherOffers}
                {removeOffer}
                {selectOffer}
              />
            {:else}
              <legend class:checkout-redesign-label={isRedesignV15Enabled}>
                <!-- LABEL: + OTHER OFFERS -->
                <span
                  class="theme-highlight"
                  on:click={() => (otherActive = true)}
                >
                  {$t(OTHER_OFFERS_ACTION)}
                  <!-- LABEL: ({count} more) -->
                  <small>
                    {formatTemplateWithLocale(
                      OTHER_OFFERS_COUNT,
                      { count: otherOffers.length },
                      $locale
                    )}
                  </small>
                </span>
              </legend>
            {/if}
          {/if}
        </div>
        {#if isRedesignV15Enabled}
          <div class="btn-container">
            <!-- offer related button (no need to use global cta) -->
            <button
              class="btn offer-cta"
              disabled={OfferCTAState.disabled}
              on:click|preventDefault={onSubmit}
            >
              {$t(APPLY_OFFER_CTA)}
            </button>
          </div>
        {/if}
      </main>
    {/if}
  </div>
  {#if isRedesignV15Enabled}
    <!-- do nothing -->
  {:else if error}
    <CTA show={false} />
  {:else if listActive}
    <CTA on:click={onSubmit} show={Boolean(selected)}>
      {$t(APPLY_OFFER_CTA)}
    </CTA>
  {/if}
{/if}

<style lang="scss">
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
    color: #3f71d7;
  }

  header.offer-nc-applied:after {
    content: '';
  }
  .offers-container .offer-action {
    float: right;
    margin-right: 4px;
    color: #3f71d7;
    font-weight: 500;
    font-size: 12px;
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
  main.main-checkout-redesign {
    height: calc(100% - 75px);
    top: 75px;
  }

  main.main-checkout-emi {
    height: 100%;
    top: unset;
  }

  main.main-one-cc header span {
    color: var(--primary-color);
  }
  .offerlist-container {
    overflow: auto;
    flex: 1;
    padding-bottom: 14px;
  }
  .offerlist-checkout-redesign {
    background-color: #fff;
    padding-bottom: 130px;
  }
  .checkout-redesign-label {
    padding: 20px 16px 16px;
    text-transform: capitalize;
    font-size: var(--font-size-body);
    color: var(--primary-text-color);
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
    top: 0px !important;
    margin-top: -2.5px;
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

  /* .checkout-redesign.error-container {
    bottom: 0px;
  } */
  .error-desc {
    padding: 16px 24px;
    border-bottom: 1px solid #ddd;
    color: #414141;
  }
  .one-cc.error-container .error-desc {
    border-bottom: 1px solid var(--light-dark-color);
    color: var(--error-validation-color);
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

  .offers-container-checkout-redesign {
    z-index: 2;
  }
  .bold {
    font-weight: 700;
    font-size: 13px;
  }

  .offer-cta {
    width: calc(100% - 32px);
    padding: 2.5px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    margin: auto;
    text-transform: capitalize;
    position: relative;
  }

  .offer-cta::after {
    opacity: 1;
    top: 1px;
    left: 0px;
    position: absolute;
    border-radius: 6px;
    width: 100%;
    height: 45px;
    content: '';
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  }

  .offer-cta:hover::after {
    opacity: 0;
  }

  .offer-cta[disabled] {
    background-color: #cdd2d6;
  }

  :global(.redesign) {
    header {
      padding: 0 16px;
      height: 36px;
      font-size: 14px;
      font-weight: 700;
      line-height: 36px;

      &:before {
        font-size: 16px;
        color: var(--primary-color);
      }

      &:after {
        top: 0;
        position: relative;
      }

      span {
        color: var(--primary-text-color);
        font-weight: 600;
      }
    }

    .offers-container {
      box-shadow: 0px -2px 2px rgba(0, 0, 0, 0.04);
    }

    .offers-container header:after {
      top: 3px;
    }

    .btn-container {
      height: 65px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      box-shadow: 0px -4px 8px rgba(107, 108, 109, 0.15);
    }
    .offer-action {
      font-weight: 400;
      font-size: 12px;
    }
    .offer-cta[disabled] {
      background-color: var(--light-dark-color);
      color: var(--tertiary-text-color);
    }
  }
</style>
