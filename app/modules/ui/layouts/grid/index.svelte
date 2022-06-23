<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Item from './item.svelte';

  // Props
  export let items = [];

  const dispatch = createEventDispatcher();
</script>

<div>
  {#each items as item (item.id)}
    <Item
      text={item.text}
      icon={item.icon}
      on:select={() => dispatch('select', { id: item.id })}
    />
  {/each}
</div>

<style>
  div {
    display: flex;
    align-content: stretch;
    flex-flow: row wrap;
    justify-content: flex-start;
    box-sizing: border-box;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04);
  }
</style>
