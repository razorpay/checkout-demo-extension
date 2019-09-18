<div
  class="netb-bank item radio-item has-tooltip"
  class:disabled
  class:has-tooltip="downtime"
  id="bank-item-{code}"
  down={disabled}
>
  <input
    class="bank-radio"
    id="bank-radio-{code}"
    type="radio"
    name="bank"
    value={code}
    {disabled}

    bind:group
  >
  <label for="bank-radio-{code}" class="radio-label mfix">
    <div class="mchild item-inner">
      <img alt="{name} Logo" src="https://cdn.razorpay.com/bank/{code}.gif">
      <div>{name}</div>
    </div>
    {#if downtime}
      <span class="downtime">
        <Tooltip
          bindTo="#form-netbanking"
          class="downtime-tooltip"
          align={['bottom']}
        >
          {fullName} accounts are facing temporary issues right now. Please select another bank.
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

<script>

import { disableBasedOnSeverityOrScheduled } from 'checkoutframe/downtimes';

export default {

  components: {
    Tooltip: 'templates/views/ui/Tooltip.svelte',
  },

  computed: {
    disabled: ({ downtime }) => downtime && disableBasedOnSeverityOrScheduled(['high', true])({ downtime })
  }

}

</script>
