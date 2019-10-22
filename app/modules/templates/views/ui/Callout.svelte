<script>
  // Props
  export let classes = [];
  export let visible = true;
  export let showIcon = true;
  export let icon = '&#x2139';
  export let type = 'warning';

  // Computed
  export let allClasses;

  $: allClasses = ['callout', type].concat(classes).join(' ');
</script>

<div class={allClasses} class:drishy={visible}>
  {#if showIcon}
    <span>&#x2139;</span>
  {/if}
  <slot />
</div>
