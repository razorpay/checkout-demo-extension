<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_up from 'account_modal/icons/arrow_up';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { ACCOUNT, SECURED_BY } from 'account_modal/i18n/labels';

  // utils Imports
  import { isRedesignV15, getPreferences, hasMerchantPolicy } from 'razorpay';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { showAccountModal, showMerchantFrame } from 'account_modal';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { constantCSSVars } from 'common/constants';

  // analytics imports
  import { Events } from 'analytics';
  import AccountEvents from 'account_modal/analytics';
  import { showAccountTab } from 'checkoutstore';

  const merchantPolicy = getPreferences('merchant_policy');
  const showMerchantPolicyBtn: boolean = hasMerchantPolicy();

  const rzp_brand_logo = getIcons().rzp_brand_logo as string;

  export let showBottomSeparator = false;
  export let logos = [rzp_brand_logo];

  function handleAccountModal() {
    Events.TrackBehav(AccountEvents.ACCOUNT_CTA_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showAccountModal();
  }

  function showMerchantDetails() {
    Events.TrackBehav(AccountEvents.ABOUT_MERCHANT_CLICKED, {
      screen_name: getCurrentScreen(),
    });
    showMerchantFrame();
  }
</script>

{#if isRedesignV15()}
  <div class="account-tab" class:hide-account-tab={!$showAccountTab}>
    <div class="separator" />
    <div class="account-tab-container">
      <div class="account-wrapper" class:no-foh={!showMerchantPolicyBtn}>
        <div class="d-flex align-center">
          <div
            data-test-id="account-tab-btn"
            class="account-section"
            on:click={handleAccountModal}
          >
            {$t(ACCOUNT)}
            <span class="account-toggle-icon">
              <Icon
                icon={arrow_up(10, 6, constantCSSVars['primary-text-color'])}
              />
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
                <Icon
                  icon={arrow_up(10, 6, constantCSSVars['primary-text-color'])}
                />
              </span>
            </div>
          {/if}
        </div>
        <div class="d-flex {showMerchantPolicyBtn ? 'rzp-column' : 'rzp-row'}">
          <span class={showMerchantPolicyBtn ? 'brand-text' : 'brand-text-row'}
            >{$t(SECURED_BY)}</span
          >
          {#if logos.length}
            <div class="d-flex align-center">
              {#each logos as logo, index}
                <Icon icon={logo} />
                {#if index !== logos.length - 1}
                  <div class="vertical-separator bg-gray" />
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
    {#if showBottomSeparator}
      <div class="separator bottom" />
    {/if}
  </div>
{/if}

<style>
  :global(.mobile) .account-tab.hide-account-tab {
    display: none;
  }
  .account-tab-container {
    margin-top: auto;
    width: 100%;
  }
  .account-wrapper {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 43px;
    padding: 0px 16px;
  }
  .account-wrapper.no-foh {
    height: unset;
    padding: 10px 16px;
  }
  .brand-text {
    font-size: var(--font-size-tiny);
    font-weight: var(--font-weight-regular);
    color: var(--tertiary-text-color);
    margin-right: 4px;
  }
  .account-section {
    cursor: pointer;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
  }

  .divider {
    width: 1px;
    height: 30px;
    margin: 0px 10px;
    background-color: #e0e0e0;
  }

  .brand-text-row {
    font-size: 11px;
    font-weight: 400;
    color: var(--tertiary-text-color);
    margin-right: 6px;
  }

  .d-flex {
    display: flex;
  }

  .align-center {
    align-items: center;
  }
  .rzp-column {
    flex-direction: column;
    align-items: flex-end;
  }

  .rzp-row {
    flex-direction: row;
    align-items: center;
  }
  .account-toggle-icon {
    margin-left: 7px;
    display: flex;
    align-items: center;
  }

  .merchant-toggle-icon {
    margin-left: 5px;
  }
  .account-tab {
    display: flex;
    min-height: 20px;
    flex-direction: column;
  }
  .separator {
    height: 8px;
    background-color: var(--background-color-magic);
  }

  .vertical-separator {
    height: 12px;
    width: 1px;
    margin: 0px 4px;
  }

  .bg-gray {
    background-color: #ebebeb;
  }
</style>
