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
  import SkeletonInstrument from './SkeletonInstrument.svelte';
  import UpiAppMethodInstrument from './UpiAppMethodInstrument.svelte';
  import { getSectionCategoryForBlock } from '../helpers';
  import { oneClickUPIIntent } from 'upi/features';

  // Props
  export let instrument;
  export let block;

  const isInstrumentLoading = instrument._loading;
  const dispatch = createEventDispatcher();

  let skipCTAClick = false;
  $: {
    skipCTAClick =
      instrument?.method === 'upi' &&
      instrument?.flows?.[0] === 'intent' &&
      oneClickUPIIntent();
  }

  function dispatchSelect() {
    instrument.skipCTAClick = skipCTAClick;
    instrument.section = getSectionCategoryForBlock(block);
    dispatch('selectInstrument', instrument);
  }
</script>

{#if isInstrumentLoading}
  <SkeletonInstrument />
{:else if isInstrumentGrouped(instrument)}
  <MethodInstrument {instrument} on:click={dispatchSelect} on:click />
{:else if isSavedCardInstrument(instrument)}
  <SavedCardInstrument {instrument} on:click={dispatchSelect} on:click />
{:else if instrument.vendor_vpa}
  <UpiAppMethodInstrument {instrument} on:click={dispatchSelect} on:click />
{:else}
  <RadioInstrument
    skipCTA={skipCTAClick}
    {instrument}
    on:click={dispatchSelect}
    on:click
  />
{/if}
