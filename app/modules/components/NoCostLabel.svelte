<script lang="ts">
  import { NO_COST_EMI } from 'ui/labels/offers';
  import Label from './Label/Label.svelte';
  export let text = NO_COST_EMI;
  export let expanded = false;

  let props = {
    text,
    expanded,
  };
</script>

<svelte:component this={Label} {...props} />
