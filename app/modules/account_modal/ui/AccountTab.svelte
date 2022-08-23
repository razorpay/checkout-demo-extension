<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_left from 'account_modal/icons/arrow_left';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { ACCOUNT, SECURED_BY } from 'account_modal/i18n/labels';

  // utils Imports
  import { isRedesignV15, getPreferences, hasMerchantPolicy } from 'razorpay';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { showAccountModal, showMerchantFrame } from 'account_modal';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import viewport from 'one_click_checkout/account_modal/viewportAction';

  // analytics imports
  import { Events } from 'analytics';
  import AccountEvents from 'account_modal/analytics';

  let showAccountTab = false;
  const merchantPolicy = getPreferences('merchant_policy');
  const showMerchantPolicyBtn: boolean = hasMerchantPolicy();

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

  function showMerchantDetails() {
    Events.TrackBehav(AccountEvents.ABOUT_MERCHANT_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showMerchantFrame();
  }
</script>

{#if isRedesignV15()}
  <div
    class="account-tab"
    use:viewport
    on:enterViewport={handleEnterViewport}
    on:exitViewport={handleExitViewport}
  >
    {#if showAccountTab}
      <div class="account-tab-container">
        <div class="account-wrapper">
          <div class="details-wrapper">
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
            {#if showMerchantPolicyBtn}
              <div class="divider" />

              <div
                data-test-id="merchant-policy-tab-btn"
                class="account-section"
                on:click={showMerchantDetails}
              >
                {merchantPolicy.display_name}
                <span class="merchant-toggle-icon">
                  <Icon icon={arrow_left(13, 13, '#212121')} />
                </span>
              </div>
            {/if}
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
    padding: 8px 16px;
    border-top: 1px solid #e0e0e0;
    margin-top: 40px;
  }

  .details-wrapper {
    display: flex;
    align-items: center;
  }

  .divider {
    width: 1px;
    height: 30px;
    margin: 0px 10px;
    background-color: #e0e0e0;
  }
  .brand-text {
    font-size: 9px;
    font-weight: 400;
    font-weight: normal;
    color: #8d97a1;
  }
  .account-section {
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: baseline;
  }
  .rzp-icon-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .account-toggle-icon {
    margin-left: 7px;
    transform: rotate(90deg);
  }

  .merchant-toggle-icon {
    margin-left: 5px;
    transform: rotate(90deg);
  }
  .account-tab {
    display: flex;
    min-height: 20px;
  }
</style>
