<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Method from 'ui/tabs/home/Method.svelte';

  // Props
  export let block;

  const dispatch = createEventDispatcher();
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

<div class="methods-block" data-block={block.code}>
  <h3 class="title">{block.title}</h3>
  <div role="list" class="border-list">
    {#each block.instruments as instrument, index (instrument.id)}
      <Method
        method={instrument.method}
        on:select={() => dispatch('selectInstrument', instrument)} />
    {/each}
  </div>
</div>
