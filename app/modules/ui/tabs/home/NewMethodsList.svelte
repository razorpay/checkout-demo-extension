<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Method from 'ui/tabs/home/Method.svelte';
  import Instrument from 'ui/tabs/home/instruments/Instrument.svelte';

  // Utils imports
  import { AVAILABLE_METHODS } from 'common/constants';
  import { shouldSeparateDebitCard } from 'checkoutstore';
  import { isMethodEnabled } from 'checkoutstore/methods';
  import { isMobile } from 'common/useragent';
  import { doesAppExist } from 'common/upi';
  import { showCtaWithDefaultText, hideCta } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Store
  import {
    contact,
    selectedInstrument,
    selectedInstrumentId,
    blocks,
    instruments,
  } from 'checkoutstore/screens/home';

  const dispatch = createEventDispatcher();
  let visibleMethods = [];

  function setMethods(methods) {
    let available = _Arr.filter(AVAILABLE_METHODS, isMethodEnabled);

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

    // Separate out debit and credit cards
    if (shouldSeparateDebitCard()) {
      available = _Arr.remove(available, 'card');
      available = ['credit_card', 'debit_card'].concat(available);
    }

    visibleMethods = available;

    const _methods = {};

    _Arr.loop(visibleMethods, method => {
      _methods[method] = true;
    });

    Analytics.track('methods:list', {
      type: AnalyticsTypes.BEHAV,
      data: {
        methods: _methods,
      },
    });
  }

  $: {
    if (!$selectedInstrument) {
      deselectInstrument();
    }
  }

  function trackInstrumentSelection(instrument, index) {
    Analytics.track('instrument:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        data: instrument,
        index,
      },
    });
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
    hideCta();
  }

  setMethods();

  function selectMethod(event) {
    dispatch('selectMethod', event.detail);
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

{#each $blocks as block}
  <h3 class="title">{block.title}</h3>
  <div role="list" class="border-list">
    {#each block.instruments as instrument, index (instrument.id)}
      <Instrument
        {instrument}
        on:click={() => trackInstrumentSelection(instrument, index)}
        on:submit />
    {/each}
  </div>
{/each}

<h3 class="title">All Payment Methods</h3>
<div role="list" class="methods-container border-list">
  {#each visibleMethods as method}
    <Method {method} on:select={selectMethod} />
  {/each}
</div>
