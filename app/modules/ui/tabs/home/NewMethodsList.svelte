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
  import {
    PREFERRED_BLOCK_TITLE,
    CONFIG_BLOCK_DEFAULT_TITLE,
    FREQUENTLY_USED_CONFIG_TITLE,
  } from 'ui/labels/methods';

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
          <!-- LABEL: Preferred Payment Methods -->
          {$t(PREFERRED_BLOCK_TITLE)}
          <!-- This is hard-coded because it exists for a lot of merchants, and hence needs translation -->
        {:else if block.code === 'block.used' && block.title === 'Frequently Used Methods'}
          {$t(FREQUENTLY_USED_CONFIG_TITLE)}
        {:else}{block.title || $t(CONFIG_BLOCK_DEFAULT_TITLE)}{/if}
      </h3>
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
