<script>
  // Svelte imports
  import { onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  import { linear } from 'svelte/easing';

  // UI imports
  import Instrument from 'ui/tabs/home/instruments/Instrument.svelte';
  import RazorpayCluster from 'ui/tabs/home/RazorpayCluster.svelte';

  // Utils imports
  import { showCtaWithDefaultText, hideCta } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSession } from 'sessionmanager';
  import { getInstrumentMeta } from 'ui/tabs/home/instruments';
  import { getAnimationOptions } from 'svelte-utils';
  import { getRTBAnalyticsPayload } from 'rtb/helper';
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
  // helpers
  import { setDynamicFees } from './helpers';

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
    setDynamicFees(instrument, 'newList');
    Analytics.track('instrument:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        instrument,
        index,
        instrumentMeta: getInstrumentMeta(instrument),
        ...getRTBAnalyticsPayload(),
      },
    });
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }
</script>

{#each $blocks as block}
  {#if block.code === 'rzp.cluster'}
    <RazorpayCluster {block} on:selectInstrument />
  {:else}
    <div
      class="methods-block"
      data-block={block.code}
      out:slide|local={getAnimationOptions({ easing: linear, duration: 300 })}
    >
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
            on:selectInstrument
            on:submit
          />
        {/each}
      </div>
    </div>
  {/if}
{/each}

<style>
  .border-list {
    margin-bottom: 24px;
  }

  /* Add delay for staggering loaders */
  .border-list > :global(.skeleton-instrument:nth-child(2n) span)::after {
    animation-delay: 0.1s;
  }
  .border-list > :global(.skeleton-instrument:nth-child(3n) span)::after {
    animation-delay: 0.2s;
  }

  .title {
    margin-top: 0;
  }

  .methods-block + .methods-block {
    margin-top: 28px;
  }
</style>
