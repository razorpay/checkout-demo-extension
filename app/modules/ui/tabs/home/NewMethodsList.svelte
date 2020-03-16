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
</style>

{#each $blocks as block}
  {#if block.code === 'rzp.cluster'}
    <RazorpayCluster {block} on:selectMethod />
  {:else}
    <div class="methods-block" data-block={block.code}>
      <h3 class="title">{block.title}</h3>
      <div role="list" class="border-list">
        {#each block.instruments as instrument, index (instrument.id)}
          <Instrument
            {instrument}
            on:click={() => trackInstrumentSelection(instrument, index)}
            on:submit />
        {/each}
      </div>
    </div>
  {/if}
{/each}
