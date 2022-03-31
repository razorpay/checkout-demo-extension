<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { CTA_LABEL, VIEW_DETAILS_LABEL } from 'one_click_checkout/cta/i18n';

  // helpers/store imports
  import { amount } from 'one_click_checkout/charges/store';
  import { showSummaryModal } from 'one_click_checkout/summary_modal';
  import { getCurrency, isOneClickCheckout } from 'razorpay';
  import { formatAmountWithSymbol } from 'common/currency';

  // Props
  export let hidden = false;
  export let disabled = false;
  export let showAmount = true;
  export let onViewDetailsClick = function () {
    showSummaryModal(false);
  };

  const currency = getCurrency();
  const dispatch = createEventDispatcher();

  /**
   * Inserts CTA node inside #one-cc-footer. This is done to ensure we have consistent appearance and position.
   * @param node {object} HTMLNode
   */
  function replaceNodeWithNewCta(node) {
    document.querySelector('#one-cc-footer').appendChild(node);

    return {
      destroy() {
        // Migrate CFU Method once migrate complete
        _El.detach(node);
      },
    };
  }
</script>

{#if isOneClickCheckout()}
  <div class="cta-container" class:hidden use:replaceNodeWithNewCta>
    {#if showAmount}
      <div class="flex-column">
        <span class="price-label">
          {formatAmountWithSymbol($amount, currency, false)}
        </span>
        <button
          id="cta-view-details"
          on:click|preventDefault={onViewDetailsClick}
          >{$t(VIEW_DETAILS_LABEL)}</button
        >
      </div>
    {/if}
    <div class="one-cc-cta-wrapper" class:full-width={!showAmount}>
      <button
        {disabled}
        class:disabled
        id="one-cc-cta"
        on:click|preventDefault={(e) => dispatch('click', e)}
      >
        <slot>{$t(CTA_LABEL)}</slot>
      </button>
    </div>
  </div>
{/if}

<style>
  .one-cc-cta-wrapper {
    width: 70%;
    min-width: 70%;
    margin-left: auto;
    position: relative;
  }

  #one-cc-cta::after {
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

  #one-cc-cta:hover::after {
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

  #one-cc-cta.disabled {
    background: #cdd2d6;
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
    gap: 8px;
    display: flex;
    padding: 22px 16px;
    align-items: center;
    box-shadow: 0px -4px 8px #6b6c6d20;
  }

  @media (min-width: 992px) {
    .cta-container {
      padding: 20px 16px;
    }
  }

  #one-cc-cta {
    width: 100%;
    padding: 18px;
    font-weight: 600;
    border-radius: 6px;
  }

  .one-cc-cta-wrapper.full-width {
    width: 100%;
    min-width: 100%;
  }

  .flex-1 {
    flex: 1;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }
</style>
