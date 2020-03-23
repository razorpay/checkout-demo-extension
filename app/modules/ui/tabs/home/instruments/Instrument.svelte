<script>
  // Utils imports
  import {
    isInstrumentForEntireMethod,
    isDetailedCardInstrument,
  } from 'configurability/instruments';

  // UI imports
  import MethodInstrument from './MethodInstrument.svelte';
  import RadioInstrument from './RadioInstrument.svelte';
  import SavedCardInstrument from './SavedCardInstrument.svelte';

  // Props
  export let instrument;

  /**
   * Tells whether or not the instrument is a card instrument
   * to be used from inside the card tab
   * @param {Instrument} instrument
   *
   * @returns {boolean}
   */
  function isInstrumentGrouped(instrument) {
    const isMethodInstrument = isInstrumentForEntireMethod(instrument);
    const isMethodCardOrEmi = _Arr.contains(['card', 'emi'], instrument.method);

    if (isMethodInstrument) {
      return true;
    }

    if (isMethodCardOrEmi) {
      const isSavedCardInstrument = instrument.token_id;

      return !isSavedCardInstrument;
    }

    return instrument._ungrouped.length > 1;
  }

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument =
    _Arr.contains(['card', 'emi'], instrument.method) && instrument.token_id;
  const isGroupedInstrument = isInstrumentGrouped(instrument);
</script>

{#if isGroupedInstrument}
  <MethodInstrument {instrument} />
{:else if isSavedCardInstrument}
  <SavedCardInstrument {instrument} />
{:else}
  <RadioInstrument {instrument} />
{/if}
