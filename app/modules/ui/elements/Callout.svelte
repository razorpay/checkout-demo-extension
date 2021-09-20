<script>
  // Props
  export let classes = [];
  export let visible = true;
  export let showIcon = true;
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

<style>
  :global(.screen-bottom .callout) {
    position: static; /* These don't need to be absolutely positioned in <BottomScreen /> */
  }
</style>
