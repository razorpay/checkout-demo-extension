<script>
  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  //Store imports
  import { isCustomerFeeBearer, showFeeLabel } from 'checkoutstore/index.js';
  //Util imports
  import { getSession } from 'sessionmanager';

  const session = getSession();

  export let isFeeBearer = isCustomerFeeBearer();

  let showFeeDetails = false;

  function handleClick() {
    showFeeDetails = !showFeeDetails;
  }
</script>

<style>
  .label {
    display: inline-block;
  }
  .fee {
    font-size: 0.6em;
  }
  .fee-helper {
    font-size: 11px;
    color: #528ff0;
    background: #fff;
    border-radius: 50%;
    height: 16px;
    width: 16px;
    text-align: center;
    display: inline-block;
    margin-bottom: 1em;
  }
  .fee-helper:hover {
    cursor: pointer;
  }

  :global(.fee-tooltip.tooltip.tooltip-bottom) {
    position: fixed;
    white-space: normal;
    text-align: left;
    margin: 0;
    transform: translateX(-50%) translateY(10px);
    left: unset;
    right: unset;
  }
</style>

{#if isFeeBearer}
  {#if $showFeeLabel}
    <div class="label">
      <span class="fee">(+ Fee)</span>
      <span on:click={handleClick} class="fee-helper has-tooltip">
        ?
        <Tooltip
          className="fee-tooltip"
          align={['bottom']}
          shown={showFeeDetails}>
          A convenience fee will be charged depending on your choice of payment
          method.
        </Tooltip>
      </span>
    </div>
  {/if}
{/if}
