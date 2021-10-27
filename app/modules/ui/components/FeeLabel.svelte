<script>
  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import InfoIcon from 'ui/elements/InfoIcon.svelte';
  import DynamicFeeBearer from './DynamicFeeBearer.svelte';

  //Store imports
  import {
    isCustomerFeeBearer,
    isOneClickCheckout,
    showFeeLabel,
    isDynamicFeeBearer,
  } from 'checkoutstore/index.js';

  import { showSummaryModal } from 'one_click_checkout/summary_modal';
  import SummaryModalEvents from 'one_click_checkout/summary_modal/analytics';
  import { Events } from 'analytics';

  const showInfo = isOneClickCheckout();
  const isFeeBearer = isCustomerFeeBearer();

  let showFeeDetails = false;
  function handleClick() {
    showFeeDetails = !showFeeDetails;
  }

  function handleInfoClick() {
    Events.Track(SummaryModalEvents.ORDER_SUMMARY_ICON_CLICK);
    showSummaryModal(false);
  }
</script>

{#if showInfo}
  <button class="label" on:click={handleInfoClick}>
    <InfoIcon />
  </button>
{:else if isFeeBearer}
  {#if $showFeeLabel}
    {#if isDynamicFeeBearer()}
      <DynamicFeeBearer />
    {:else}
      <div class="label">
        <span on:click={handleClick} class="fee-helper has-tooltip">
          <span class="fee"><u>+Fee</u></span>
          <Tooltip
            className="fee-tooltip"
            align={['bottom']}
            shown={showFeeDetails}
          >
            A convenience fee will be charged depending on your choice of
            payment method.
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
    transform: translateX(-50%) translateY(10px);
    left: unset;
    right: unset;
  }
</style>
