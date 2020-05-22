<script>
  // Svelte Imports
  import { createEventDispatcher } from 'svelte';

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

  const dispatch = createEventDispatcher();

  function dispatchSelect() {
    dispatch('selectInstrument', instrument);
  }
</script>

{#if isInstrumentGrouped(instrument)}
  <MethodInstrument {instrument} on:click={dispatchSelect} on:click />
{:else if isSavedCardInstrument(instrument)}
  <SavedCardInstrument {instrument} on:click={dispatchSelect} on:click />
{:else}
  <RadioInstrument {instrument} on:click={dispatchSelect} on:click />
{/if}
