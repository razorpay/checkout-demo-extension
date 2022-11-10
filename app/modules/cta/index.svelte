<script lang="ts">
  // i18n imports
  import { locale, t } from 'svelte-i18n';
  import { CTA_LABEL, VIEW_DETAILS_LABEL } from 'cta/i18n';

  // helpers/store imports
  import CTAStore from 'cta/store';
  import {
    getAmount,
    getCurrency,
    isCustomerFeeBearer,
    isOneClickCheckout,
  } from 'razorpay';
  import { formatAmountWithSymbol } from 'common/currency';
  import { appliedOffer } from 'offers/store/store';

  // util imports
  import FeeLabel from 'ui/components/FeeLabel.svelte';
  import { formatTemplateWithLocale } from 'i18n';

  import autotest from 'autotest';

  // Props
  export let showAmount = true;
  let offerAmount = 0;

  let isOneCCEnabled = isOneClickCheckout();

  $: {
    if (
      $appliedOffer &&
      $appliedOffer.original_amount &&
      $appliedOffer.amount
    ) {
      offerAmount = $appliedOffer.original_amount - $appliedOffer.amount;
    } else {
      offerAmount = 0;
    }
  }
  let feeLabelVisible = false;
  const defaultCTA = CTA_LABEL;
  let stateMap = CTAStore.stateMap;
  let onViewDetailsClick = CTAStore.onViewDetailsClick.bind(CTAStore);
  let activeScreenStore = CTAStore.activeCTAScreen;
  let activeScreen = 'default-tab';
  let state: any;
  let label: string;
  $: {
    activeScreen = $activeScreenStore;
    state = $stateMap[activeScreen] || { show: false };
    label = formatTemplateWithLocale(
      state.label || defaultCTA,
      state.labelData || {},
      $locale
    );
  }

  const store = CTAStore.store;
  $: disableVariant = state.variant === 'disabled';

  let reduceAmountSize = false;
  $: {
    try {
      if (($store.amount || getAmount())?.toString()?.length > 5) {
        reduceAmountSize = true;
      }
    } catch (e) {
      // no action
    }
  }
</script>

<div
  class="cta-container"
  class:hidden={!state.show}
  class:with-amount={state.showAmount}
  class:reduce-amount-size={reduceAmountSize}
>
  {#if state.showAmount}
    <div class="flex-column">
      {#if offerAmount > 0 && !isOneCCEnabled}
        <span class="offer-original-amount">
          {formatAmountWithSymbol(
            $appliedOffer?.original_amount || getAmount(),
            $store.currency || getCurrency(),
            true
          )}
        </span>
      {/if}
      <span class="price-label">
        {#if offerAmount > 0 && !isOneCCEnabled}
          {formatAmountWithSymbol(
            $appliedOffer?.amount || getAmount(),
            $store.currency || getCurrency(),
            true
          )}
        {:else}
          {@html $store.rawAmount ||
            formatAmountWithSymbol(
              $store.amount || getAmount(),
              $store.currency || getCurrency(),
              true
            )}
        {/if}
      </span>
      {#if isCustomerFeeBearer()}
        <span id="fee-wrapper">
          <span class="fee">
            <FeeLabel bind:visible={feeLabelVisible} />
          </span>
        </span>
      {/if}
      {#if !feeLabelVisible}
        <button
          type="button"
          id="cta-view-details"
          data-test-id="cta-view-details"
          on:click|preventDefault={onViewDetailsClick}
          >{$t(VIEW_DETAILS_LABEL)}</button
        >
      {/if}
    </div>
  {/if}
  <div class="redesign-v15-cta-wrapper" class:full-width={!showAmount}>
    <button
      disabled={state.disabled}
      class:disabled={disableVariant || state.disabled}
      id="redesign-v15-cta"
      on:click|preventDefault={(e) => {
        CTAStore.triggerAction(e);
      }}
      on:click|preventDefault
      {...autotest('cta')}
    >
      <slot>{label}</slot>
    </button>
  </div>
</div>

<style lang="scss">
  .redesign-v15-cta-wrapper {
    width: 100%;
    max-width: 100%;
    margin-left: auto;
    position: relative;
  }
  .with-amount .redesign-v15-cta-wrapper {
    max-width: 70%;
  }

  .reduce-amount-size .price-label {
    font-size: 13px !important;
  }

  /* #redesign-v15-cta:not(.disabled)::after {
    left: 0;
    top: 0;
    opacity: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  } */

  #redesign-v15-cta:hover::after {
    opacity: 0;
  }

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .cta-container.hidden {
    display: none;
  }

  #redesign-v15-cta.disabled {
    background: #e9e9ea;
    color: #949494;
    pointer-events: none;
  }

  .price-label {
    color: #263a4a;
    font-size: 16px;
    font-weight: 600;
    line-height: 18px;
  }

  #cta-view-details {
    font-size: 10px;
    text-align: left;
    color: #8d97a1;
  }

  .cta-container {
    z-index: 2;
    gap: 8px;
    display: flex;
    padding: 10px 16px;
    align-items: center;
    box-shadow: 0px -4px 8px #6b6c6d20;
  }

  .offer-original-amount {
    font-size: 10px;
    color: #8d97a1;
    text-decoration: line-through;
  }

  #redesign-v15-cta {
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 5px;

    color: var(--text-color);
    background: var(--primary-color);
    background: linear-gradient(
      180deg,
      var(--background-color) 0%,
      var(--primary-color) 100%
    );
  }

  .redesign-v15-cta-wrapper.full-width {
    width: 100%;
    min-width: 100%;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }
  :global(.redesign) {
    .price-label {
      color: var(--primary-text-color);
      font-size: var(--font-size-heading);
      font-weight: var(--font-weight-semibold);
      line-height: 18px;
    }
    #cta-view-details {
      font-size: var(--font-size-tiny);
      text-align: left;
      color: var(--tertiary-text-color);
      margin-top: 2px;
    }
    .cta-container {
      padding: 10px 14px;
      box-shadow: 0px -10px 10px rgba(23, 26, 30, 0.15);
    }
    :global(.cta-btn),
    #redesign-v15-cta {
      padding: 14px 18px;
      font-size: var(--font-size-body);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      background: var(--primary-color);
      position: relative;
    }
    :global(.cta-btn::after),
    #redesign-v15-cta::after {
      left: 0;
      top: 0;
      opacity: 1;
      position: absolute;
      width: 100%;
      height: 100%;
      content: '';
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.1),
        rgba(0, 0, 0, 0.1)
      );
    }
    #redesign-v15-cta.disabled {
      background: var(--light-dark-color);
      color: var(--tertiary-text-color);
      pointer-events: none;
    }
  }
</style>
