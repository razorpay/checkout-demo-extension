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
          bindTo="#netb-banks"
          class="downtime-tooltip"
          align={['bottom']}
          alignOnHover="true"
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

export default {

  components: {
    Tooltip: 'templates/views/ui/Tooltip.svelte',
  },

  computed: {
    disabled: ({ downtime }) => downtime &&
        _Arr.contains(['high', 'scheduled'], downtime.severity) // TODO refactor into a function
  }

}

</script>
