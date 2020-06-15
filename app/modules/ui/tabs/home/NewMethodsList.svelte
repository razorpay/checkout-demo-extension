<script>
  // Svelte imports
  import { onDestroy } from 'svelte';

  // UI imports
  import Instrument from 'ui/tabs/home/instruments/Instrument.svelte';
  import RazorpayCluster from 'ui/tabs/home/RazorpayCluster.svelte';

  // Utils imports
  import { showCtaWithDefaultText, hideCta } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSession } from 'sessionmanager';
  import { getInstrumentMeta } from 'ui/tabs/home/instruments';

  // Store
  import {
    selectedInstrument,
    selectedInstrumentId,
    blocks,
  } from 'checkoutstore/screens/home';

  onDestroy(() => {
    deselectInstrument();
  });

  const session = getSession();

  $: {
    if (session.screen === '') {
      if ($selectedInstrument) {
        showCtaWithDefaultText();
      } else {
        hideCta();
      }
    }
  }

  function trackInstrumentSelection(instrument, index) {
    Analytics.track('instrument:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        instrument,
        index,
        instrumentMeta: getInstrumentMeta(instrument),
      },
    });
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }

  /* Add delay for staggering loaders */
  .border-list > :global(.loading-instrument:nth-child(2n) span)::after {
    animation-delay: 0.1s;
  }
  .border-list > :global(.loading-instrument:nth-child(3n) span)::after {
    animation-delay: 0.2s;
  }
</style>

{#each $blocks as block}
  {#if block.code === 'rzp.cluster'}
    <RazorpayCluster {block} on:selectMethod />
  {:else}
    <div class="methods-block" data-block={block.code}>
      <h3 class="title">{block.title || 'Available Payment Methods'}</h3>
      <div role="list" class="border-list">
        {#each block.instruments as instrument, index (instrument.id)}
          <Instrument
            {instrument}
            on:click={() => trackInstrumentSelection(instrument, index)}
            on:submit
            on:selectMethod />
        {/each}
      </div>
    </div>
  {/if}
{/each}
