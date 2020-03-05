<script>
  // Utils imports
  import { isInstrumentForEntireMethod } from 'configurability/instruments.js';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';

  // Props
  export let instrument;

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument = instrument.method && instrument.token_id;
</script>

{#if isMethodInstrument}
  <MethodInstrument {instrument} />
{:else if isSavedCardInstrument}
  <SavedCardInstrument {instrument} />
{:else}
  <RadioInstrument {instrument} />
{/if}
