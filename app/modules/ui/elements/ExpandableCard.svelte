<script lang="ts">
  import Stack from 'ui/layouts/Stack.svelte';
  import Radio from 'ui/elements/Radio.svelte';

  // Props
  export let expanded;
  export let showRadio = false;

  // Computed
  export let elementClass;

  $: {
    const list = ['expandable-card'];

    if (expanded) {
      list.push('expandable-card--expanded');
    }

    elementClass = list.join(' ');
  }
</script>

<div class={elementClass} on:click>
  <div class="expandable-card-title">
    <Stack horizontal>
      <slot name="title" />
      {#if showRadio}
        <Radio checked={expanded} />
      {/if}
    </Stack>
  </div>
  <div class="expandable-card-detail">
    <slot name="detail" />
  </div>
</div>

<style>
  .expandable-card-title > :global(.stack) {
    justify-content: space-between;
    align-items: flex-start;
  }

  .expandable-card-title > :global(.stack) > :global([slot='title']) {
    line-height: 24px;
  }
</style>
