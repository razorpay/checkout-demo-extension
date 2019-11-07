<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Tooltip from 'templates/views/ui/Tooltip.svelte';

  // Props
  export let down;
  export let method;
  export let icon;
  export let title;
  export let downMessage;
  export let description;

  const dispatch = createEventDispatcher();

  export function selectMethod() {
    dispatch('select', {
      down,
      method,
    });
  }
</script>

<div
  class="payment-option item"
  {down}
  tab={method}
  class:has-tooltip={down}
  on:click={selectMethod}>

  <label>
    {#if method === 'gpay'}
      <i class="gpay-icon" />
    {:else}
      <i>
        {@html icon}
      </i>
    {/if}
    <span class="title">{title}</span>
    {#if down}
      <span class="downtime">
        <Tooltip
          bindTo="#payment-options"
          className="downtime-tooltip"
          align={['top']}>
          {downMessage}
        </Tooltip>
      </span>
    {/if}
    <span class="desc">{description}</span>
  </label>
</div>
