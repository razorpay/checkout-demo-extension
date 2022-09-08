<script lang="ts">
  // svelte imports
  import { createEventDispatcher, tick } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import back_arrow from 'one_click_checkout/topbar/icons/back_arrow';

  // store imports
  import { showFeeLabel } from 'checkoutstore/fee';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import {
    breadcrumbItems,
    shouldHideTab,
    tabTitle,
  } from 'one_click_checkout/topbar/store';
  import { headerVisible } from 'one_click_checkout/header/store';
  import { getAmount } from 'razorpay';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { PAYMENTS_LABEL } from 'one_click_checkout/topbar/i18n/label';

  // UI Imports
  import BreadcrumbItem from 'one_click_checkout/topbar/ui/BreadcrumbItem.svelte';

  // utils imports
  import { setAmount } from 'one_click_checkout/topbar/sessionInterface';
  import {
    dynamicFeeObject,
    addCardView,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';

  const dispatch = createEventDispatcher();
  let shown = true;
  let highlightText;
  let isBackEnabled = true;
  const blackListedTabTitle = ['home-1cc', 'otp'];
  $: {
    highlightText = $activeRoute?.breadcrumHighlight || PAYMENTS_LABEL;

    if ($activeRoute?.hasOwnProperty('isBackEnabled')) {
      isBackEnabled = $activeRoute?.isBackEnabled;
      if (typeof isBackEnabled === 'function') {
        isBackEnabled = isBackEnabled();
      }
    } else {
      isBackEnabled = true;
    }
  }
  export function show() {
    shown = true;
  }

  export function hide() {
    shown = false;
  }

  function handleBackClick() {
    //For QR Based Feebearer payements, set the amount to the original amount.
    const amount = getAmount();
    setAmount(amount);
    $showFeeLabel = true;
    tick().then(() => {
      dynamicFeeObject.set({});
      showFeesIncl.set({});
      addCardView.set('');
    });

    const handler = $activeRoute.props?.handleBack;
    if (handler) {
      handler();
    }

    dispatch('back');
  }
</script>

{#if shown}
  <div id="topbar-new">
    <div class="title-section">
      {#if isBackEnabled}
        <span
          class="back"
          data-testid="back"
          data-test-id="back"
          on:click={handleBackClick}
        >
          <Icon icon={back_arrow()} />
        </span>
      {/if}
      {#if $activeRoute?.topbarTitle || !blackListedTabTitle?.includes($tabTitle)}
        {$activeRoute?.topbarTitle ? $t($activeRoute.topbarTitle) : $tabTitle}
      {/if}
    </div>
    {#if !$activeRoute?.hideBreadcrumb && !$tabTitle && !$activeRoute?.topbarTitle}
      <div data-test-id="breadcrumb-nav" class="breadcrumb">
        {#each $breadcrumbItems as breadcrumbItem, i}
          <BreadcrumbItem
            selected={breadcrumbItem === highlightText}
            label={breadcrumbItem}
            showIcon={i < $breadcrumbItems.length - 1}
            hide={$shouldHideTab[breadcrumbItem]}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  #topbar-new {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid var(--light-dark-color);
    border-bottom: 1px solid var(--light-dark-color);
    padding: 8px 16px;
    align-items: center;
    box-sizing: border-box;
    height: 44px;
    z-index: 2;
    box-shadow: 0px 7px 10px 0px rgba(23, 26, 30, 0.15);
  }
  .back {
    cursor: pointer;
    margin-right: 10px;
  }
  .breadcrumb {
    display: flex;
    align-items: center;
  }
  .title-section {
    display: flex;
    align-items: center;
    font-weight: 600;
    text-transform: capitalize;
  }
</style>
