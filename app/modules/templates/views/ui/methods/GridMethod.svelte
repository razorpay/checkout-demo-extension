<div
  class="payment-option item"
  down={method.down}
  tab="{method.method}"

  class:has-tooltip="method.down"

  on:click="fire('click', event)"
>

  <label>
    <i>{@html method.icon}</i>
    <span class="title">{method.title}</span>
    {#if method.down}
      <span class="downtime">
        i
        <Tooltip
          bindTo="#payment-options"
          class="downtime-tooltip"
          align={['top']}
        >
          {method.downMessage}
        </Tooltip>
      </span>
    {/if}
    <span class="desc">{method.description}</span>
  </label>
</div>

<script>
  export default {
    components: {
      Tooltip: 'templates/views/ui/Tooltip.svelte',
    },
  }
</script>
