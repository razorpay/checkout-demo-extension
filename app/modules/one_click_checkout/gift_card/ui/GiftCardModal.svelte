<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import GiftCardForm from 'one_click_checkout/gift_card/ui/GiftCardForm.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    MODAL_TITLE,
    CTA_LABEL,
  } from 'one_click_checkout/gift_card/i18n/labels';

  // Analytics imports
  import { Events } from 'analytics';
  import GiftCardEvents from 'one_click_checkout/gift_card/analytics';

  // store imports
  import { showLoader } from 'one_click_checkout/loader/store';
  import { giftCardForm as giftCardFormValue } from 'one_click_checkout/gift_card/store';

  // utils imports
  import { popStack } from 'navstack';
  import { applyGiftCard } from 'one_click_checkout/gift_card/helpers';

  // constant
  import { constantCSSVars } from 'common/constants';

  let disabled = false;
  function onClose() {
    popStack();
  }

  function onFormCompletion({ detail: { isComplete } }) {
    disabled = !isComplete;
  }

  onMount(() => {
    Events.TrackRender(GiftCardEvents.GC_BOTTOM_SHEET_LOADED);
  });

  onDestroy(() => {
    $giftCardFormValue = {};
  });

  const handleGiftCardApply = () => {
    Events.TrackBehav(GiftCardEvents.GC_APPLY_CLICKED, {
      gc_card_number: $giftCardFormValue?.giftCardNumber,
    });
    applyGiftCard();
  };
</script>

<div
  id="gift-card-modal"
  data-test-id="gift-card-modal"
  class="gift-card-modal"
  class:loader-view={$showLoader}
>
  <div class="table-wrapper">
    <div class="heading-container">
      <p class="heading-text">
        {$t(MODAL_TITLE)}
      </p>
      <div
        class="gift-card-close"
        data-testid="gift-card-close"
        on:click={onClose}
      >
        <Icon icon={close(20, 20, constantCSSVars['secondary-text-color'])} />
      </div>
    </div>
    <hr class="separator" />
    <GiftCardForm on:formCompletion={onFormCompletion} />
  </div>
  {#if !$showLoader}
    <div class="cta-container">
      <div class="cta-wrapper">
        <button
          class="modal-cta"
          data-testid="modal-cta"
          data-test-id="modal-cta"
          class:disabled
          on:click={handleGiftCardApply}
          {disabled}
        >
          {$t(CTA_LABEL)}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .gift-card-modal {
    box-sizing: border-box;
    background: white;
    text-align: start;
    bottom: 0;
    width: 100%;
    padding-top: 16px;
  }

  .modal-cta::after {
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

  :global(.mobile) .gift-card-modal {
    bottom: 0;
  }

  .table {
    font-size: var(--font-size-body);
    font-style: normal;
    font-weight: var(--font-weight-regular);
    line-height: 16px;
    letter-spacing: 0;
    color: #8d97a1;
    padding: 0 16px;
  }

  .text-green {
    color: var(--positive-text-color);
  }

  .heading-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }

  .heading-text {
    font-weight: var(--font-weight-semibold);
    line-height: 16px;
    margin: 0;
  }

  .gift-card-close {
    cursor: pointer;
  }

  .separator {
    margin: 0 16px 15px;
    border: 1px solid var(--light-dark-color);
    border-bottom: none;
  }

  .cta-container {
    padding: 10px 14px;
    box-shadow: 0 -4px 4px rgba(166, 158, 158, 0.08);
  }

  .cta-wrapper {
    position: relative;
  }
  .modal-cta {
    width: 100%;
    padding: 14px 18px;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    border-radius: 5px;
    font-family: 'Inter', 'lato', ubuntu, helvetica, sans-serif !important;

    color: var(--text-color);
    background: var(--primary-color);
  }

  .disabled {
    background: var(--light-dark-color);
    color: var(--tertiary-text-color);
  }

  :global(#form .gift-card-card) {
    bottom: 0;
    position: absolute;
    z-index: 999;
  }

  :global(#form .gift-card-loader-backdrop) {
    height: 100%;
  }

  :global(#form .gift-card-card > .wrapper .content) {
    align-items: start;
    padding-left: 16px;
  }

  .loader-view {
    padding-bottom: 40px;
  }

  #gift-card-modal > :global(.toast-wrapper) {
    bottom: 64px;
  }

  :global(.gift-card-modal .toast-wrapper) {
    z-index: 0;
  }
</style>
