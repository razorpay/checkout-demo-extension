<script lang="ts">
  import { lastOf } from 'utils/array';
  import { elementRef, elements } from './store';

  $: lastEl = lastOf($elements);
</script>

<div id="root" class:active={lastEl}>
  {#if lastEl}
    <svelte:component
      this={lastEl.component}
      {...lastEl.props || {}}
      bind:this={$elementRef}
    />
  {/if}
</div>
