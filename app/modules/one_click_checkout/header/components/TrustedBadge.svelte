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
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import RtbIcon from 'rtb/ui/component/RTBIcon.svelte';
  import { getThemeMeta } from 'checkoutstore/theme';
  const themeMeta = getThemeMeta();

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
        <RtbIcon height={20} width={20} />
      </div>
      <div class="rtb-text">{$t(RTB_HEADER)}</div>
      <Icon icon={info(themeMeta.textColor)} />
    </div>
  {:else}
    <div class="rtb-collapsed-wrapper" on:click={handleRTBClick}>
      <div class="rtb-icon-wrapper">
        <RtbIcon height={20} width={20} />
      </div>
      <div class="rtb-down-arrow-wrapper">
        <Icon icon={arrow_down(14, 14, themeMeta.textColor)} />
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .rtb-icon-wrapper {
    height: 20px;
  }

  /* Styles for expended RTB */
  .rtb-expanded-wrapper {
    background: #e7f7f1;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }

  .rtb-text {
    font-size: var(--font-size-tiny);
    line-height: 150%;
    font-weight: var(--font-weight-semibold);
    margin: 0 4px;
  }

  /* Styles for collapsed RTB */
  .rtb-collapsed-wrapper {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  :global(.one-click-checkout) {
    .rtb-expanded-wrapper {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 4px 8px;
    }
  }
</style>
