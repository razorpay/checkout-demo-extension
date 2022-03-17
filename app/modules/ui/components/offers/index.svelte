<script>
  import { tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency, isOneClickCheckout } from 'razorpay';
  import { getAnimationOptions } from 'svelte-utils';
  import { CRED_EXPERIMENTAL_OFFER_ID } from 'checkoutframe/cred';
  import { CredEvents, OfferEvents, Events } from 'analytics/index';

  import {
    getOffersForTab,
    getOffersForInstrument,
    getOtherOffers,
    getOffersForTabAndInstrument,
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
  } from 'ui/labels/offers';

  import CTAOneCC from 'one_click_checkout/cta/index.svelte';
  import CTA from 'ui/elements/CTA.svelte';
  import OfferItemList from './OfferItemList.svelte';
  import {
    selectedInstrument,
    methodInstrument,
  } from 'checkoutstore/screens/home';
  import {
    appliedOffer,
    isCardValidForOffer,
    showOffers,
  } from 'checkoutstore/offers';

  export let applicableOffers; // eligible offers array
  export let setAppliedOffer;
  export let onShown;
  export let onHide;

  let listActive;
  let otherActive;
  let selected = null; // locally selected offer
  let error;
  let errorCb;
  let otherOffers = [];
  let discount;
  let previousApplied = {};
  let currentTab;
  let renderCtaOneCC = false;

  $: {
    _El.keepClass(_Doc.querySelector('#header'), 'offer-fade', listActive);
    if (!listActive) {
      otherActive = false;
    }
  }
  $: _El.keepClass(_Doc.querySelector('#header'), 'offer-error', error);

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

    var invalidateOffer = false;
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

    renderCtaOneCC = true;

    if (isOneClickCheckout()) {
      const headerMagicCheckout = document.querySelector('#header-1cc');
      headerMagicCheckout.classList.add('offers-fade');
    }
    onShown();
  }

  function hideList(shouldMountCta) {
    renderCtaOneCC = false;
    listActive = false;
    selected = null;

    // onHide basically mounts the active screen's cta..don't do it in edge cases. (When going back from home screen)
    if (shouldMountCta) {
      onHide();
    }
    if (isOneClickCheckout()) {
      const headerMagicCheckout = document.querySelector('#header-1cc');
      headerMagicCheckout.classList.remove('offers-fade');
    }
  }

  export function isListShown() {
    return listActive;
  }

  export function onSubmit() {
    applyOffer(selected);
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
    selected = offer;
  }
</script>

{#if $showOffers}
  <div
    class="offers-container"
    id="offers-container"
    hidden={applicableOffers.length + otherOffers.length === 0}
    class:has-error={error}
  >
    <header
      on:click={showList}
      class:applied={$appliedOffer && $isCardValidForOffer}
    >
      <span>
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
        <span class="offer-action theme-highlight">
          <!-- LABEL: Change / Select -->
          {$appliedOffer ? $t(CHANGE_ACTION) : $t(SELECT_ACTION)}
        </span>
      </span>
    </header>
    {#if error}
      <div class="error-container" class:one-cc={isOneClickCheckout()}>
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
        class:main-one-cc={isOneClickCheckout()}
        transition:fly|local={getAnimationOptions({ y: 40, duration: 200 })}
      >
        <header class="close-offerlist" on:click={hideList}>
          <!-- LABEL: Select an offer -->
          {$t(SELECT_OFFER_HEADER)}
          <!-- LABEL: Hide -->
          <span>{$t(HIDE_ACTION)}</span>
        </header>
        <div
          class="offerlist-container"
          class:offerlist-one-cc={isOneClickCheckout()}
        >
          {#if applicableOffers.length}
            <!-- LABEL: Available Offers -->
            <legend class:one-cc-label={isOneClickCheckout()}
              >{$t(AVAILABLE_OFFERS_HEADER)}</legend
            >
            <OfferItemList
              {selected}
              offers={applicableOffers}
              {removeOffer}
              {selectOffer}
            />
          {:else}
            <legend>
              <!-- LABEL: No offers available for this method. Please look at other offers
              available below -->
              <small>{$t(NO_OFFER_AVAILABLE_METHOD_MESSAGE)}</small>
            </legend>
          {/if}
          {#if otherOffers.length}
            {#if otherActive || !applicableOffers.length}
              {#if otherActive}
                <!-- LABEL: Other Offers -->
                <legend class:one-cc-label={isOneClickCheckout()}
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
              <legend>
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
      </main>
    {/if}
  </div>
  {#if renderCtaOneCC}
    <CTAOneCC
      disabled={error || !selected}
      on:click={onSubmit}
      showAmount={false}
    >
      {$t(APPLY_OFFER_CTA)}
    </CTAOneCC>
  {:else if error}
    <CTA show={false} />
  {:else if listActive}
    <CTA on:click={onSubmit} show={Boolean(selected)}>{$t(APPLY_OFFER_CTA)}</CTA
    >
  {/if}
{/if}

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
  main.main-one-cc {
    height: calc(100% - 104px);
    top: inherit;
  }
  .offerlist-container {
    overflow: auto;
    flex: 1;
    padding-bottom: 14px;
  }
  .offerlist-one-cc {
    background-color: #fff;
  }
  .one-cc-label {
    padding: 24px 14px;
    text-transform: capitalize;
    font-size: 14px;
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

  .one-cc.error-container {
    bottom: 96px;
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
