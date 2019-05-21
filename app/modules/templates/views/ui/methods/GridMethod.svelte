<div
  class="payment-option item"
  down={down}
  tab="{method}"

  class:has-tooltip="down"

  on:click="selectMethod(event)"
>

  <label>
    {#if method === 'gpay'}
      <i class="gpay-icon"> </i>
    {:else}
      <i>{@html icon}</i>
    {/if}
    <span class="title">{title}</span>
    {#if down}
      <span class="downtime">
        <Tooltip
          bindTo="#payment-options"
          class="downtime-tooltip"
          align={['top']}
        >
          {downMessage}
        </Tooltip>
      </span>
    {/if}
    <span class="desc">{description}</span>
  </label>
</div>

<script>
  export default {
    components: {
      Tooltip: 'templates/views/ui/Tooltip.svelte',
    },

    methods: {
      selectMethod: function (event) {
        const {
          down,
          method,
        } = this.get();

        event.data = {
          down,
          method,
        };

        this.fire('select', event);
      }
    }
  }
</script>
