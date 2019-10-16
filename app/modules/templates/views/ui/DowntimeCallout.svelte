<script>
  // UI imports
  import Callout from 'templates/views/ui/Callout.svelte';

  // Props
  export let isHighSeverity;

  // Computed
  let calloutType;

  $: calloutType = isHighSeverity ? 'error' : 'warning';
</script>

<Callout type={calloutType} classes={['downtime-callout']} showIcon={false}>
  <slot />
</Callout>
