<script>
  // Svelte Imports
  import { onMount } from 'svelte';

  // Imports Related to RTB
  import { RTB } from 'checkoutstore/rtb';
  import { showRTBModal } from 'one_click_checkout/rtb_modal';
  import {
    getTrustedBadgeHighlights,
    getTrustedBadgeAnaltyicsPayload,
  } from 'trusted-badge/helper';

  //i18n
  import { TRUSTED_BADGE_HEADER } from 'trusted-badge/i18n/labels';
  import { t } from 'svelte-i18n';

  // Imports releated to icons
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';
  import info from 'ui/icons/payment-methods/info';

  // Props Import
  export let expanded;
  export let sendAnalytics = true;

  //Utils
  import { Events } from 'analytics';
  import rtbEvents from 'one_click_checkout/header/analytics';
  import TrustedBadge from 'one_click_checkout/common/ui/TrustedBadge.svelte';

  $: trustedBadgeHighlights = getTrustedBadgeHighlights($RTB);
  onMount(() => {
    if (sendAnalytics) {
      Events.TrackRender(rtbEvents.RTB_RENDER, {
        ...getTrustedBadgeAnaltyicsPayload(),
      });
    }
  });
</script>

{#if trustedBadgeHighlights}
  {#if expanded}
    <div class="rtb-expanded-wrapper" on:click={showRTBModal}>
      <div class="rtb-icon-wrapper">
        <TrustedBadge />
      </div>
      <div class="rtb-text">{$t(TRUSTED_BADGE_HEADER)}</div>
      <Icon icon={info('#263A4A')} />
    </div>
  {:else}
    <div class="rtb-collapsed-wrapper" on:click={showRTBModal}>
      <div class="rtb-icon-wrapper">
        <TrustedBadge />
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
