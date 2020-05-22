<script>
  // Utils imports
  import {
    isInstrumentGrouped,
    isSavedCardInstrument,
  } from 'configurability/instruments';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';

  // Props
  export let instrument;
</script>

{#if isInstrumentGrouped(instrument)}
  <MethodInstrument {instrument} on:click on:selectMethod />
{:else if isSavedCardInstrument(instrument)}
  <SavedCardInstrument {instrument} on:click />
{:else}
  <RadioInstrument {instrument} on:click />
{/if}
