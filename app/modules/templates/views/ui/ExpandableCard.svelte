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

<div class={elementClass} on:click>
  <div class="expandable-card-title">
    {#if showRadio}
      <Stack horizontal reverse>
        <Radio checked={expanded} />
      </Stack>
    {/if}
    <slot name="title" />
    {#if badge}
      <div class="badge">{badge}</div>
    {/if}
  </div>
  <div class="expandable-card-detail">
    <slot name="detail" />
  </div>
</div>
