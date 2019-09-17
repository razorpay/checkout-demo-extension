<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  // Props
  export let visible = true;
  export let listItems = [];
  export let badge = false;

  const dispatch = createEventDispatcher();

  export function selectOption(value) {
    dispatch('select', value);
  }
</script>

{#if visible}
  <div class="options-list" transition:fade={{ duration: 200 }}>
    {#each listItems as item}
      <div class="option" on:click={() => selectOption(item.value)}>
        <span>
          {@html item.text}
        </span>
        {#if item.badge}
          <div class="badge">{item.badge}</div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
