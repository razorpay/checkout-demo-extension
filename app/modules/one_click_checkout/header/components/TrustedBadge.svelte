<script lang="ts">
  // Svelte Imports
  import { onMount } from 'svelte';

  // Imports Related to RTB
  import { RTBExperiment } from 'rtb/store';
  import { showRTBModal } from 'one_click_checkout/rtb_modal';
  import { isRTBEnabled, getRTBAnalyticsPayload } from 'rtb/helper';

  //i18n
  import { RTB_HEADER } from 'rtb/i18n/labels';
  import { t } from 'svelte-i18n';

  // Imports releated to icons
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';
  import info from 'ui/icons/payment-methods/info';

  // Props Import
  export let expanded;
  export let sendAnalytics = true;

  // Analytics imports
  import { Events } from 'analytics';
  import RTBEvents from 'one_click_checkout/rtb_modal/analytics';

  //Utils
  import rtbEvents from 'one_click_checkout/header/analytics';
  import TrustedBadgeIcon from 'one_click_checkout/common/ui/TrustedBadge.svelte';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  $: trustedBadgeHighlights = isRTBEnabled($RTBExperiment);
  onMount(() => {
    if (sendAnalytics) {
      Events.TrackRender(rtbEvents.RTB_RENDER, {
        ...getRTBAnalyticsPayload(),
      });
    }
  });

  const handleRTBClick = () => {
    Events.TrackBehav(RTBEvents.RTB_BADGE_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showRTBModal();
  };
</script>

{#if trustedBadgeHighlights}
  {#if expanded}
    <div class="rtb-expanded-wrapper" on:click={handleRTBClick}>
      <div class="rtb-icon-wrapper">
        <TrustedBadgeIcon />
      </div>
      <div class="rtb-text">{$t(RTB_HEADER)}</div>
      <Icon icon={info('#263A4A')} />
    </div>
  {:else}
    <div class="rtb-collapsed-wrapper" on:click={handleRTBClick}>
      <div class="rtb-icon-wrapper">
        <TrustedBadgeIcon />
      </div>
      <div class="rtb-down-arrow-wrapper">
        <Icon icon={arrow_down(10, 8)} />
      </div>
    </div>
  {/if}
{/if}

<style>
  .rtb-icon-wrapper {
    height: 22px;
  }

  /* Styles for expended RTB */
  .rtb-expanded-wrapper {
    background: #e7f7f1;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .rtb-text {
    font-size: 12px;
    line-height: 150%;
    font-weight: 600;
    margin: 0px 6px 0px 4px;
  }

  /* Styles for collapsed RTB */
  .rtb-collapsed-wrapper {
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .rtb-down-arrow-wrapper {
    margin-left: 5px;
  }
</style>
