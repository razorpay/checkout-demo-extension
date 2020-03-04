<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Props
  export let personalization = false;
  export let instruments = [];
  export let customer = {};

  // UI imports
  import Method from 'ui/elements/methods/Method.svelte';
  import CardInstrument from 'ui/elements/Personalization/CardInstrument.svelte';
  import Instrument from 'ui/elements/Personalization/Instrument.svelte';

  // Utils imports
  import { AVAILABLE_METHODS } from 'common/constants';
  import { getSession } from 'sessionmanager';
  import { isMobile } from 'common/useragent';
  import { doesAppExist } from 'common/upi';
  import { getInstrumentsForCustomer } from 'checkoutframe/personalization';
  import { showCtaWithDefaultText, hideCta } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Store
  import { contact, selectedInstrumentId } from 'checkoutstore/screens/home';

  const dispatch = createEventDispatcher();
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

    // Separate out debit and credit cards
    if (session.get('theme.debit_card')) {
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
    if ($selectedInstrumentId) {
      const selected = _Arr.find(
        instruments || [],
        instrument => instrument.id === $selectedInstrumentId
      );

      if (!selected) {
        deselectInstrument();
      }
    }
  }

  function trackP13nInstrumentSelected(instrument, index) {
    Analytics.track('p13:method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        data: instrument,
        index,
      },
    });
  }

  function selectP13nInstrument(instrument, index) {
    trackP13nInstrumentSelected(instrument, index);

    if (instrument.method === 'card') {
      const tokens = _Obj.getSafely(customer, 'tokens.items', []);
      const existing = _Arr.find(
        tokens,
        token => token.id === instrument.token_id
      );

      if (existing) {
        setTimeout(() => {
          // Focus on the input field
          // TODO: Figure out a better way to do this
          const extraInput = _Doc.querySelector(
            '#instruments-list > .selected input.input'
          );

          if (extraInput) {
            extraInput.focus();
          }
        });
      } else {
        selectMethod({
          detail: {
            method: 'card',
          },
        });

        return;
      }
    }

    $selectedInstrumentId = instrument.id;
    showCtaWithDefaultText();
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
    hideCta();
  }

  setMethods(session.methods);

  function selectMethod(event) {
    dispatch('selectMethod', event.detail);
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

{#if personalization && instruments && instruments.length}
  <h3 class="title">Preferred Payment Methods</h3>
  <div role="list" class="border-list" id="instruments-list">
    {#each instruments as instrument, index (instrument.id)}
      {#if instrument.method === 'card'}
        <CardInstrument
          name="p13n"
          {instrument}
          {customer}
          selected={instrument.id === $selectedInstrumentId}
          on:click={() => selectP13nInstrument(instrument, index)} />
      {:else}
        <Instrument
          name="p13n"
          {instrument}
          selected={instrument.id === $selectedInstrumentId}
          on:click={() => selectP13nInstrument(instrument, index)}
          on:submit />
      {/if}
    {/each}
  </div>
{/if}

<h3 class="title">All Payment Methods</h3>
<div role="list" class="methods-container border-list">
  {#each visibleMethods as method}
    <Method {method} on:select={selectMethod} />
  {/each}
</div>
