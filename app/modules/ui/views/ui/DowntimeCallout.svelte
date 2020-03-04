<script>
  // UI imports
  import Callout from 'templates/views/ui/Callout.svelte';

  // Props
  export let severe = false;

  // Computed
  let calloutType;

  $: calloutType = severe ? 'error' : 'warning';
</script>

<Callout type={calloutType} classes={['downtime-callout']} showIcon={false}>
  <slot />
</Callout>
