<script lang="ts">
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
  :global(#content.one-cc .callout) {
    color: var(--primary-text-color);
    padding: 16px;
  }
  :global(.redesign) {
    .recurring-callout {
      background: linear-gradient(89.97deg, #fff5d8 -1.19%, #fffaed 99.97%);
      display: flex;
      font-size: 12px;
      line-height: 18px;
      font-weight: 400;
      padding: 10px 16px 10px 18px !important;
      > span {
        font-size: 14px;
        margin-right: 10px;
      }
    }
  }
</style>
