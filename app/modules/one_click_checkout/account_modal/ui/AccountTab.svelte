<script>
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_left from 'one_click_checkout/account_modal/icons/arrow_left';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    ACCOUNT,
    SECURED_BY,
  } from 'one_click_checkout/account_modal/i18n/labels';

  // utils Imports
  import { isOneClickCheckout } from 'razorpay';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { showAccountModal } from 'one_click_checkout/account_modal';

  const { rzp_brand_logo } = getIcons();
</script>

{#if isOneClickCheckout()}
  <div class="account-tab-container">
    <div class="account-section" on:click={showAccountModal}>
      {$t(ACCOUNT)}
      <span class="account-toggle-icon">
        <Icon icon={arrow_left(13, 13, '#212121')} />
      </span>
    </div>
    <div class="rzp-icon-section">
      <span class="brand-text">{$t(SECURED_BY)}</span>
      <Icon icon={rzp_brand_logo} />
    </div>
  </div>
{/if}

<style>
  .account-tab-container {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 1px solid #c4c4c4;
    margin-top: auto;
  }
  .brand-text {
    font-size: 12px;
    font-weight: normal;
    color: #8d97a1;
    margin-right: 6px;
  }
  .account-section {
    cursor: pointer;
    font-size: 14px;
    display: flex;
  }
  .rzp-icon-section {
    display: flex;
    align-items: center;
  }
  .account-toggle-icon {
    margin-left: 7px;
    transform: rotate(90deg);
    margin-top: 2px;
  }
  .tab-bottom {
    position: absolute;
    bottom: 0px;
    width: 87%;
  }
</style>
