<script>
  // UI imports
  import Callout from 'ui/elements/Callout.svelte';

  // Props
  export let severe;

  // Computed
  let downtimeClasses = 'downtime-callout';
  // let
</script>

<style>
  .downtime-callout {
    width: 80%;
    margin-left: 6%;
    padding: 10px;
  }
  .downtime-low {
    background: rgba(255, 219, 92, 0.4);
    color: #f99d27;
  }
  .downtime-medium {
    background: gba(255, 219, 92, 0.4);
    color: #f99d27;
  }
  .downtime-high {
    background: rgba(255, 219, 92, 0.4);
    color: #e95555;
  }
</style>

<div class={`downtime-callout downtime-${severe}`} showIcon={false}>
  <slot />
</div>
