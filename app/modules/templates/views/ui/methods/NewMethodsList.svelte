<script>
  // Props
  export let personalization = false;
  export let instruments = [];

  // UI imports
  import Method from 'templates/views/ui/methods/Method.svelte';
  import CardInstrument from 'templates/views/ui/Personalization/CardInstrument.svelte';
  import Instrument from 'templates/views/ui/Personalization/Instrument.svelte';

  // Utils imports
  import { AVAILABLE_METHODS } from 'common/constants';
  import { getSession } from 'sessionmanager';
  import { isMobile } from 'common/useragent';
  import { doesAppExist } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getInstrumentsForCustomer } from 'checkoutframe/personalization';

  // Store
  import { contact, selectedInstrumentId } from 'checkoutstore/screens/home';

  const session = getSession();
  let visibleMethods = [];

  function filterMethods(methods) {
    return _Arr.filter(AVAILABLE_METHODS, method => {
      return _.isArray(methods[method])
        ? Boolean(methods[method].length)
        : methods[method];
    });
  }

  function setMethods(methods) {
    let available = filterMethods(methods);

    /**
     * Cardless EMI and EMI are the same payment option.
     * When we click EMI, it should take to Cardless EMI if
     * cardless_emi is an available method.
     */
    if (
      _Arr.contains(available, 'cardless_emi') &&
      _Arr.contains(available, 'emi')
    ) {
      available = _Arr.remove(available, 'emi');
    }

    /**
     * We do not want to show QR in the primary list
     * of payment options anymore
     */
    available = _Arr.remove(available, 'qr');

    // TODO: Filter based on amount

    visibleMethods = available;
  }

  $: {
    if ($selectedInstrumentId) {
      const selected = _Arr.find(
        instruments || [],
        instrument => instrument.id === selectedInstrumentId
      );

      if (!selected) {
        deselectInstrument();
      }
    }
  }

  function selectP13nInstrument(instrument) {
    $selectedInstrumentId = instrument.id;
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }

  setMethods(session.methods);

  function selectMethod(event) {
    Analytics.track('p13:method:select', {
      type: AnalyticsTypes.BEHAV,
      data: event.detail,
    });

    const { down, method } = event.detail;

    if (down) {
      return;
    }

    session.switchTab(method);
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

{#if personalization}
  <div role="list" class="border-list">
    {#each instruments as instrument, index (instrument.id)}
      {#if instrument.method === 'card'}
        <CardInstrument
          name="p13n"
          {instrument}
          selected={instrument.id === $selectedInstrumentId}
          on:click={() => selectP13nInstrument(instrument)} />
      {:else}
        <Instrument
          name="p13n"
          {instrument}
          selected={instrument.id === $selectedInstrumentId}
          on:click={() => selectP13nInstrument(instrument)} />
      {/if}
    {/each}
  </div>
{/if}

<div role="list" class="methods-container border-list">
  {#each visibleMethods as method}
    <Method {method} on:select={selectMethod} />
  {/each}
</div>
