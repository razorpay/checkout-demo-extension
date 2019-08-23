<div class="netb-bank item radio-item" id="bank-item-{code}" down={Boolean(downtime)}>
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
          bindTo="#bank-item-{code}"
          class="downtime-tooltip"
          align={['bottom']}
        >
          Down
        </Tooltip>
      </span>
    {/if}
  </label>
</div>

<script>

export default {

  components: {
    Tooltip: 'templates/views/ui/Tooltip.svelte',
  }

}

</script>
