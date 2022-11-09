<script lang="ts">
  import downTimeIcon from 'ui/icons/payment-methods/downtimeIcon';
  import Icon from 'ui/elements/Icon.svelte';

  // Props
  export let severe;
  let lowSeverityColor = '#F99D27';
  let highSeverityColor = '#E95555';
  let circleColor = '';
  let arrowColor = '';

  $: circleColor = severe !== 'high' ? lowSeverityColor : highSeverityColor;
  $: arrowColor = severe !== 'low' ? highSeverityColor : lowSeverityColor;
</script>

{#if severe}
  <Icon loadableIcon={false} icon={downTimeIcon(circleColor, arrowColor)} />
{/if}
