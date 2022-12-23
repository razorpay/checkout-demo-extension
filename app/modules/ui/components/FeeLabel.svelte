<script lang="ts">
  import { onMount } from 'svelte';

  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import DynamicFeeBearer from './DynamicFeeBearer.svelte';

  //Store imports
  import { showFeeLabel } from 'checkoutstore/fee';
  import { showFeeBearerToolTip } from 'store/feebearer';

  import {
    getMerchantName,
    isCustomerFeeBearer,
    isDynamicFeeBearer,
    isRedesignV15,
  } from 'razorpay';

  import { clickOutside } from 'one_click_checkout/helper';

  const FEE_BEARER_VIEW_TIME = 4000;
  const isFeeBearer = isCustomerFeeBearer();
  const isRedesignV15Enabled = isRedesignV15();
  let showFeeDetails = false;
  const merchantName = getMerchantName();
  let timeout: ReturnType<typeof setTimeout>;

  export let visible = false;
  export let autoTooltip = true;
  function triggerToolTip() {
    timeout ? clearTimeout(timeout) : null;
    showFeeDetails = true;
    timeout = setTimeout(() => {
      showFeeDetails = false;
    }, FEE_BEARER_VIEW_TIME);
  }

  const handleHideTooltip = () => {
    timeout ? clearTimeout(timeout) : null;
    showFeeDetails = false;
  };
  onMount(() => {
    if (
      isFeeBearer &&
      $showFeeLabel &&
      isRedesignV15Enabled &&
      !isDynamicFeeBearer() &&
      !$showFeeBearerToolTip &&
      autoTooltip
    ) {
      triggerToolTip();
    }
  });

  $: visible = isFeeBearer && $showFeeLabel;
</script>

{#if isFeeBearer}
  {#if $showFeeLabel}
    {#if isDynamicFeeBearer()}
      <DynamicFeeBearer {autoTooltip} />
    {:else}
      <div class="label" use:clickOutside on:click_outside={handleHideTooltip}>
        <span on:click={triggerToolTip} class="fee-helper has-tooltip">
          <span class="fee">+Fee</span>
          <Tooltip
            className={`fee-tooltip ${
              isRedesignV15Enabled ? 'checkout-redesign' : ''
            }`}
            align={isRedesignV15Enabled ? ['top', 'right'] : ['bottom']}
            shown={showFeeDetails}
          >
            A convenience fee will be charged by {merchantName} depending on your
            choice of payment method.
          </Tooltip>
        </span>
      </div>
    {/if}
  {/if}
{/if}

<style>
  .label {
    display: inline-block;
  }

  .fee {
    font-size: 0.6em;
    text-decoration: underline;
  }

  :global(.redesign) .fee {
    font-size: var(--font-size-small);
    color: var(--tertiary-text-color);
    text-decoration: none;
  }
  .fee-helper {
    cursor: pointer;
  }

  :global(.fee-tooltip.tooltip.tooltip-bottom) {
    font-size: 11px;
    position: fixed;
    white-space: normal;
    text-align: left;
    margin: 0;
    transform: translateX(-88%) translateY(10px);
    left: unset;
    right: unset;
  }

  :global(.checkout-redesign.tooltip.tooltip-top.tooltip-right) {
    font-size: 11px;
    position: absolute;
    white-space: normal;
    text-align: left;
    margin: 0;
    left: unset;
    right: unset;
    width: 225px;
    background-color: #363636;
    top: -30px;
  }

  :global(.redesign) {
    .fee {
      font-size: 10px;
    }
  }
</style>
