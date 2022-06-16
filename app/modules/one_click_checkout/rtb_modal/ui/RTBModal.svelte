<script>
  import { onDestroy } from 'svelte';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  //i18n Imports
  import {
    RTB_HEADER,
    RTB_HIGHLIGHT1,
    RTB_HIGHLIGHT2,
    RTB_HIGHLIGHT3,
    RTB_CONTENT,
  } from 'rtb/i18n/labels';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import RTBEvents from 'one_click_checkout/rtb_modal/analytics';

  // utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getMerchantName } from 'razorpay';
  import TrustedBadgeIcon from 'one_click_checkout/common/ui/TrustedBadge.svelte';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { popStack } from 'navstack';

  const { circle_check, rtb_close } = getIcons();
  const merchantName = getMerchantName();
  let listItems = [RTB_HIGHLIGHT1, RTB_HIGHLIGHT2, RTB_HIGHLIGHT3];

  onDestroy(() => {
    Events.TrackBehav(RTBEvents.RTB_BADGE_DISMISSED, {
      screen_name: getCurrentScreen(),
    });
  });
</script>

<div class="rtb-container">
  <div class="rtb-header">
    <div class="rtb-icon">
      <TrustedBadgeIcon height="62" width="60" />
    </div>
    <div class="rtb-header-section">
      <div class="rtb-header-text">{merchantName}</div>
      <div class="rtb-title">{$t(RTB_HEADER)}</div>
      <hr align="left" class="rtb-separator" />
    </div>
    <div class="rtb-close" on:click={() => popStack()}>
      <Icon icon={rtb_close} />
    </div>
  </div>
  <div class="rtb-content">
    <div class="rtb-summary">
      {formatTemplateWithLocale(RTB_CONTENT, { merchantName }, $locale)}
    </div>
    {#each listItems as listItem}
      <div class="rtb-list">
        <Icon icon={circle_check} />
        <span class="rtb-list-text">{$t(listItem)}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .rtb-container {
    box-sizing: border-box;
    position: absolute;
    background: #fff;
    text-align: start;
    bottom: 0px;
    width: 100%;
    padding: 16px;
  }
  .rtb-content {
    background: #e7f7f1;
    color: #616161;
    padding: 16px 16px 2px;
    border-radius: 4px;
  }
  .rtb-list {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }
  .rtb-list-text {
    padding-left: 8px;
    font-size: 12px;
    font-weight: 600;
  }
  .rtb-summary {
    font-size: 14px;
    line-height: 20px;
    padding-bottom: 20px;
  }
  .rtb-header {
    display: flex;
    align-items: flex-start;
    padding-bottom: 6px;
  }
  .rtb-title {
    font-size: 16px;
    font-weight: 600;
  }
  .rtb-header-section {
    padding-left: 4px;
    padding-top: 4px;
  }
  .rtb-header-text {
    font-size: 14px;
    font-weight: 600;
    padding-bottom: 4px;
  }
  .rtb-container {
    text-align: left;
  }
  .rtb-close {
    position: absolute;
    right: 20px;
    cursor: pointer;
  }
  .rtb-separator {
    border: 2px solid #59d686;
    width: 34%;
    border-radius: 4px;
  }
  .rtb-icon {
    padding-right: 4px;
  }
  :global(.mobile) .rtb-container {
    bottom: 0;
  }
</style>
