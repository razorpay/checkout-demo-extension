<script>
  // Props
  export let expanded;
  export let badge;

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
    <slot name="title" />
    {#if badge}
      <div class="badge">{badge}</div>
    {/if}
  </div>
  <div class="expandable-card-detail">
    <slot name="detail" />
  </div>
</div>
