<script>
  import Stack from 'templates/layouts/Stack.svelte';
  import Radio from 'templates/views/ui/Radio.svelte';

  // Props
  export let expanded;
  export let badge;
  export let showRadio = false;

  // Computed
  export let elementClass;

  $: {
    const list = ['expandable-card'];

    if (expanded) {
      list.push('expandable-card--expanded');
    }

    if (badge) {
      list.push('expandable-card--has-badge');
    }

    elementClass = list.join(' ');
  }
</script>

<style>
  .expandable-card-title > :global(.stack) {
    justify-content: space-between;
    align-items: flex-start;
  }

  .expandable-card-title > :global(.stack) > :global([slot='title']) {
    line-height: 24px;
  }

  .badge {
    flex-shrink: 0;
    margin: 2px 8px 0;
    border: 1px solid #70be53;
    border-radius: 2px;
    background-color: #f7fbf5;
    color: #70be53;
    font-size: 10px;
    padding: 0 3px;
    text-transform: uppercase;
    pointer-events: none;
  }
</style>

<div class={elementClass} on:click>
  <div class="expandable-card-title">
    <Stack horizontal>
      <slot name="title" />
      {#if badge}
        <div class="badge">{badge}</div>
      {/if}
      {#if showRadio}
        <Radio checked={expanded} />
      {/if}
    </Stack>
  </div>
  <div class="expandable-card-detail">
    <slot name="detail" />
  </div>
</div>
