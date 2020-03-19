<script>
  // Utils imports
  import {
    isInstrumentForEntireMethod,
    isDetailedCardInstrument,
  } from 'configurability/instruments.js';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';
  import CardInstrument from './CardInstrument.svelte';

  // Props
  export let instrument;

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument =
    _Arr.contains(['card', 'emi'], instrument.method) && instrument.token_id;
  const isCardInstrument = isDetailedCardInstrument(instrument);
</script>

{#if isMethodInstrument}
  <MethodInstrument {instrument} />
{:else if isSavedCardInstrument}
  <SavedCardInstrument {instrument} />
{:else if isCardInstrument}
  <CardInstrument {instrument} />
{:else}
  <RadioInstrument {instrument} />
{/if}
