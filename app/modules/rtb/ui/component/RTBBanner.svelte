<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // Components
  import RTBIcon from './RTBIcon.svelte';
  import InfoIcon from 'ui/elements/InfoIcon.svelte';
  //Utils
  import { Events } from 'analytics';
  import { getRTBAnalyticsPayload, isRTBEnabled } from 'rtb/helper';
  //i18n
  import { RTB_HEADER } from 'rtb/i18n/labels';
  import { t } from 'svelte-i18n';
  import { RTBEvents } from 'rtb/events';
  import { pushOverlay } from 'navstack';
  import RTBOverlay from './RTBOverlay.svelte';
  import { RTBExperiment } from 'rtb/store';

  $: rtbEnabled = isRTBEnabled($RTBExperiment);

  onMount(() => {
    Events.TrackRender(RTBEvents.BANNER_SHOW, getRTBAnalyticsPayload());
  });

  function handleInfoClicked(e: MouseEvent) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    pushOverlay({
      component: RTBOverlay,
      overlay: true,
      props: {},
    });

    Events.TrackBehav(RTBEvents.BANNER_CLICK, getRTBAnalyticsPayload());
  }
</script>

{#if rtbEnabled}
  <rtb-banner
    class="rtb-banner"
    on:click={handleInfoClicked}
    data-testid="rtb-banner"
  >
    <div class="rtb-title">
      <RTBIcon />
      <div class="rtb-labels">
        {$t(RTB_HEADER)}
      </div>
    </div>
    <div class="rtb-info">
      <InfoIcon variant="disabled" />
    </div>
  </rtb-banner>
{/if}

<style>
  .rtb-banner {
    display: flex;
    justify-content: center;
    padding: 4px 20px;
    display: flex;
    align-items: center;
    pointer-events: auto;
    cursor: pointer;
  }

  .rtb-banner .rtb-title {
    display: flex;
    flex: 1;
    padding: 4px 0;
    align-items: center;
    justify-content: left;
  }
  .rtb-banner .rtb-info {
    display: block;
  }
  .rtb-labels {
    font-size: 14px;
    margin-left: 6px;
    display: inline-block;
    line-height: 16px;
    color: #363636;
  }

  :global(.screen) > :global(.screen-main) {
    padding-top: 0 !important;
  }
</style>
