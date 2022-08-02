<script lang="ts">
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
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import viewport from 'one_click_checkout/account_modal/viewportAction';

  // analytics imports
  import { Events } from 'analytics';
  import AccountEvents from 'one_click_checkout/account_modal/analytics';

  let showAccountTab = false;

  const { rzp_brand_logo } = getIcons();

  function handleAccountModal() {
    Events.TrackBehav(AccountEvents.ACCOUNT_CTA_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showAccountModal();
  }

  const handleEnterViewport = () => {
    setTimeout(() => {
      showAccountTab = true;
    }, 1200);
  };
  const handleExitViewport = () => {
    showAccountTab = false;
  };
</script>

{#if isOneClickCheckout()}
  <div
    class="account-tab"
    use:viewport
    on:enterViewport={handleEnterViewport}
    on:exitViewport={handleExitViewport}
  >
    {#if showAccountTab}
      <div class="account-tab-container">
        <div class="account-wrapper">
          <div
            data-test-id="account-tab-btn"
            class="account-section"
            on:click={handleAccountModal}
          >
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
      </div>
    {/if}
  </div>
{/if}

<style>
  .account-tab-container {
    margin-top: auto;
    width: 100%;
  }
  .account-wrapper {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid #e0e0e0;
    margin-top: 20%;
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
  .account-tab {
    display: flex;
    min-height: 20px;
  }
</style>
