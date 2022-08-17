<script lang="ts">
  // i18n imports
  import { t } from 'svelte-i18n';
  import { CTA_LABEL, VIEW_DETAILS_LABEL } from 'one_click_checkout/cta/i18n';

  // helpers/store imports
  import { amount } from 'one_click_checkout/charges/store';
  import { showSummaryModal } from 'one_click_checkout/summary_modal';
  import { getCurrency, isOneClickCheckout } from 'razorpay';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  // Analytics imports
  import { Events } from 'analytics';
  import CTAEvents from 'one_click_checkout/cta/analytics';

  // util imports
  import * as _El from 'utils/DOM';

  // UI Imports
  import CTAButton from 'one_click_checkout/cta/button.svelte';

  // Props
  export let hidden = false;
  export let disabled = false;
  export let showAmount = true;
  export let handleDisable = false;
  export let onViewDetailsClick = function () {
    Events.TrackBehav(CTAEvents.VIEW_DETAILS_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showSummaryModal({ withCta: false });
  };

  const currency = getCurrency();

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
          data-test-id="cta-view-details"
          on:click|preventDefault={onViewDetailsClick}
          >{$t(VIEW_DETAILS_LABEL)}</button
        >
      </div>
    {/if}
    <CTAButton fullWidth={!showAmount} {disabled} {handleDisable} on:click>
      <slot>{$t(CTA_LABEL)}</slot>
    </CTAButton>
  </div>
{/if}

<style>
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .cta-container.hidden {
    display: none;
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
    padding: 14px 16px;
    align-items: center;
    box-shadow: 0px -4px 8px #6b6c6d20;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }
</style>
