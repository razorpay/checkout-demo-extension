<script lang="ts">
  // Props
  export let disabled = false;
  export let code = '';
  export let group = null;
  export let name = '';
  export let fullName = '';

  // UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
</script>

<div
  class="netb-bank item radio-item has-tooltip"
  class:disabled
  class:has-tooltip={disabled}
  down={disabled}
  id="bank-item-{code}"
>
  <input
    {disabled}
    class="bank-radio"
    id="bank-radio-{code}"
    name="bank"
    type="radio"
    value={code}
    on:change={({ target: { value } }) => {
      group = value;
    }}
    checked={group?.replace('_C', '') === code}
  />
  <label for="bank-radio-{code}" class="radio-label mfix">
    <div class="mchild item-inner">
      <img alt="" src="https://cdn.razorpay.com/bank/{code}.gif" />
      <div>{name}</div>
    </div>
    {#if disabled}
      <span class="downtime">
        <Tooltip
          bindTo="#form-netbanking"
          className="downtime-tooltip"
          align={['bottom']}
        >
          {fullName}
          accounts are facing temporary issues right now. Please select another bank.
        </Tooltip>
      </span>
    {/if}
  </label>
</div>

<style>
  .netb-bank {
    overflow: visible;
  }

  .netb-bank.disabled {
    cursor: default;
  }

  .netb-bank.disabled .item-inner {
    opacity: 0.3;
  }
</style>
