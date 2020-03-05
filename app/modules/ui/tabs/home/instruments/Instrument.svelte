<script>
  // Utils imports
  import { isInstrumentForEntireMethod } from 'configurability/instruments.js';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import InputInstrument from './InputInstrument.svelte';

  // Props
  export let instrument;

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument = instrument.method && instrument.token; // TODO
  const isInputInstrument = isSavedCardInstrument;
</script>

{#if isMethodInstrument}
  <MethodInstrument {instrument} />
{:else if isInputInstrument}
  <InputInstrument {instrument} />
{:else}
  <RadioInstrument {instrument} />
{/if}
