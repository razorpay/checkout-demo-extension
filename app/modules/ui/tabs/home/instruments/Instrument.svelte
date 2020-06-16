<script>
  // Utils imports
  import {
    isInstrumentGrouped,
    isSavedCardInstrument,
  } from 'ui/tabs/home/instruments';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';
  import SkeletonInstrument from './SkeletonInstrument.svelte';

  // Props
  export let instrument;

  const isInstrumentLoading = instrument._loading;
</script>

{#if isInstrumentLoading}
  <SkeletonInstrument />
{:else if isInstrumentGrouped(instrument)}
  <MethodInstrument {instrument} on:click on:selectMethod />
{:else if isSavedCardInstrument(instrument)}
  <SavedCardInstrument {instrument} on:click />
{:else}
  <RadioInstrument {instrument} on:click />
{/if}
