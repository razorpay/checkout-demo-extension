<div class="netb-bank item radio-item" id="bank-item-{code}" down={Boolean(downtime)} class:has-tooltip="downtime">
  <input
    class="bank-radio"
    id="bank-radio-{code}"
    type="radio"
    name="bank"
    value={code}

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
          Down
        </Tooltip>
      </span>
    {/if}
  </label>
</div>

<style>
  .netb-bank {
    overflow: visible;
  }
</style>

<script>

export default {

  components: {
    Tooltip: 'templates/views/ui/Tooltip.svelte',
  }

}

</script>
