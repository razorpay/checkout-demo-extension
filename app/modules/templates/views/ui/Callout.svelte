<script>
  // Props
  export let classes = [];
  export let visible = true;
  export let showIcon = true;
  export let icon = '&#x2139';

  // Computed
  export let allClasses;

  $: allClasses = ['callout'].concat(classes).join(' ');
</script>

<div class={allClasses} class:drishy={visible}>
  {#if showIcon}
    <span>&#x2139;</span>
    &nbsp;
  {/if}
  <slot />
</div>
