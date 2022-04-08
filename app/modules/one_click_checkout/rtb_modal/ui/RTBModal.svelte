<script>
  // UI Imports
  import Backdrop from 'one_click_checkout/common/ui/Backdrop.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  //i18n Imports
  import {
    TRUSTED_BADGE_HEADER,
    TRUSTED_BADGE_HIGHLIGHT1,
    TRUSTED_BADGE_HIGHLIGHT2,
    TRUSTED_BADGE_HIGHLIGHT3,
    TRUSTED_BADGE_CONTENT,
  } from 'trusted-badge/i18n/labels';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  // utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getMerchantName } from 'razorpay';
  import TrustedBadgeIcon from 'one_click_checkout/common/ui/TrustedBadge.svelte';

  const { circle_check, rtb_close } = getIcons();
  const merchantName = getMerchantName();
  let visible = false;
  let listItems = [
    TRUSTED_BADGE_HIGHLIGHT1,
    TRUSTED_BADGE_HIGHLIGHT2,
    TRUSTED_BADGE_HIGHLIGHT3,
  ];

  export function show() {
    visible = true;
  }

  export function hide() {
    visible = false;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      hide();
    }
  }
</script>

<Backdrop {visible} on:click={handleBackdropClick}>
  <div class="rtb-container">
    <div class="rtb-header">
      <div class="rtb-icon">
        <!-- It is done intentionally. Both RTB Badges styles were getting else wise over lapped-->
        {#if visible}
          <TrustedBadgeIcon height="62" width="60" />
        {/if}
      </div>
      <div class="rtb-header-section">
        <div class="rtb-header-text">{merchantName}</div>
        <div class="rtb-title">{$t(TRUSTED_BADGE_HEADER)}</div>
        <hr align="left" class="rtb-separator" />
      </div>
      <div class="rtb-close" on:click={hide}>
        <Icon icon={rtb_close} />
      </div>
    </div>
    <div class="rtb-content">
      <div class="rtb-summary">
        {formatTemplateWithLocale(
          TRUSTED_BADGE_CONTENT,
          { merchantName },
          $locale
        )}
      </div>
      {#each listItems as listItem}
        <div class="rtb-list">
          <Icon icon={circle_check} />
          <span class="rtb-list-text">{$t(listItem)}</span>
        </div>
      {/each}
    </div>
  </div>
</Backdrop>

<style>
  .rtb-container {
    box-sizing: border-box;
    position: absolute;
    background: #fff;
    text-align: start;
    bottom: -55px;
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
