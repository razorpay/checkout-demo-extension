<script>
  // UI imports
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';

  // Props
  export let severe;
  export let showIcon = false;
  // Computed
  let downtimeClasses = 'downtime-callout';
  // let
</script>

<style>
  .downtime-callout {
    margin: auto;
    padding: 10px;
    background: rgba(255, 219, 92, 0.4);
    color: #f99d27;
    display: flex;
    align-items: center;
  }
  .downtime-high {
    color: #e95555;
  }
  .downtime-icon {
    margin-right: 10px;
  }
</style>

<div class={`downtime-callout downtime-${severe}`}>
  {#if showIcon}
    <div class="downtime-icon">
      <DowntimeIcon {severe} />
    </div>
  {/if}
  <div>
    <slot />
  </div>
</div>
