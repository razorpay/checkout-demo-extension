<script lang="ts">
  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import DynamicFeeBearer from './DynamicFeeBearer.svelte';

  //Store imports
  import { showFeeLabel } from 'checkoutstore/index.js';

  import { isCustomerFeeBearer, isDynamicFeeBearer } from 'razorpay';

  const isFeeBearer = isCustomerFeeBearer();

  let showFeeDetails = false;
  function handleClick() {
    showFeeDetails = !showFeeDetails;
  }
</script>

{#if isFeeBearer}
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
