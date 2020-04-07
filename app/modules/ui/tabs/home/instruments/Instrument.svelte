<script>
  // Utils imports
  import { isInstrumentForEntireMethod } from 'configurability/instruments';

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

    /**
     * All the methods that have a token.
     * UPI has tokens, but it needs some more checks on
     * the flows as well. It's not needed now, but we will eventually need to add it.
     *
     * TODO: Check for UPI in isMethodWithToken
     */
    const isMethodWithToken = _Arr.contains(['card', 'emi'], instrument.method);

    if (isMethodInstrument) {
      return true;
    }

    if (isMethodWithToken) {
      const doesTokenExist = instrument.token_id;

      return !doesTokenExist;
    }

    if (instrument.method === 'upi' && instrument.flows) {
      // More than one flow always needs to go deeper
      if (instrument.flows.length > 1) {
        return true;
      }

      // UPI collect, omnichannel always need to go deeper
      if (
        _Arr.contains(instrument.flows, 'collect') ||
        _Arr.contains(instrument.flows, 'omnichannel')
      ) {
        return true;
      }

      // If flow is intent and no apps are specified, go deeper
      if (_Arr.contains(instrument.flows, 'intent') && !instrument.apps) {
        return true;
      }
    }

    return instrument._ungrouped.length > 1;
  }

  const isMethodInstrument = isInstrumentForEntireMethod(instrument);
  const isSavedCardInstrument =
    _Arr.contains(['card', 'emi'], instrument.method) && instrument.token_id;
  const isGroupedInstrument = isInstrumentGrouped(instrument);
</script>

{#if isGroupedInstrument}
  <MethodInstrument {instrument} on:click />
{:else if isSavedCardInstrument}
  <SavedCardInstrument {instrument} on:click />
{:else}
  <RadioInstrument {instrument} on:click />
{/if}
