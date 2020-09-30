<script>
  import { onMount } from 'svelte';
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
</style>

{#if isFeeBearer}
  {#if $showFeeLabel}
    <div class="label">
      <span class="fee">(+ Fee)</span>
      <span on:click={handleClick} class="fee-helper has-tooltip">
        ?
        <Tooltip
          class="downtime-tooltip"
          align={['bottom']}
          shown={showFeeDetails}>
          A convenience fee will be charged depending on your choice of payment
          method.
        </Tooltip>
      </span>
    </div>
  {/if}
{/if}
