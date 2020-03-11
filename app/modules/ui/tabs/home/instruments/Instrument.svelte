<script>
  // Utils imports
  import { isInstrumentForEntireMethod } from 'configurability/instruments.js';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';

  import { selectedInstrumentId } from 'checkoutstore/screens/home';

  // Props
  export let instrument;

  let selected = false;
  $: selected = $selectedInstrumentId === instrument.id;

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument =
    _Arr.contains(['card', 'emi'], instrument.method) && instrument.token_id;

  function selectInstrument() {
    $selectedInstrumentId = instrument.id;
  }
</script>

{#if isMethodInstrument}
  <MethodInstrument {instrument} />
{:else if isSavedCardInstrument}
  <SavedCardInstrument {instrument} />
{:else}
  <RadioInstrument {instrument} {selected} on:click={selectInstrument} />
{/if}
