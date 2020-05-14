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

  // i18n
  import { t } from 'svelte-i18n';
  import { PREFERRED_BLOCK_TITLE } from 'ui/labels/methods';

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
</style>

{#each $blocks as block}
  {#if block.code === 'rzp.cluster'}
    <RazorpayCluster {block} on:selectMethod />
  {:else}
    <div class="methods-block" data-block={block.code}>
      <h3 class="title">
        {#if block.code === 'rzp.preferred'}
          {$t(PREFERRED_BLOCK_TITLE)}
        {:else}{block.title || 'Available Payment Methods'}{/if}
      </h3>
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
