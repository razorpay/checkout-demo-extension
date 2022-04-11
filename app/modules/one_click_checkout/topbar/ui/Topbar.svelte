<script>
  // svelte imports
  import { createEventDispatcher, tick } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // store imports
  import { showFeeLabel } from 'checkoutstore';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { breadcrumbItems, tabTitle } from 'one_click_checkout/topbar/store';
  import { headerVisible } from 'one_click_checkout/header/store';
  import { getAmount } from 'razorpay';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { PAYMENTS_LABEL } from 'one_click_checkout/topbar/i18n/label';

  // session imports
  import { handleModalClose } from 'one_click_checkout/header/sessionInterface';

  // utils imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { setAmount } from 'one_click_checkout/topbar/sessionInterface';
  import {
    dynamicFeeObject,
    addCardView,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';

  const dispatch = createEventDispatcher();
  const { back_arrow, double_arrow } = getIcons();
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

    dispatch('back');
  }
</script>

{#if shown}
  <div id="topbar-new" class:topbar-header={!$headerVisible}>
    <div class="title-section">
      {#if isBackEnabled}
        <span class="back" on:click={handleBackClick}>
          <Icon icon={back_arrow} />
        </span>
      {/if}
      {#if $activeRoute?.topbarTitle || !blackListedTabTitle?.includes($tabTitle)}
        {$activeRoute?.topbarTitle ? $t($activeRoute.topbarTitle) : $tabTitle}
      {/if}
    </div>
    {#if $activeRoute?.topbarTitle}
      <button class="modal-close" on:click={handleModalClose}>
        <Icon icon={close()} />
      </button>
    {/if}
    {#if !$activeRoute?.hideBreadcrumb && !$tabTitle && !$activeRoute?.topbarTitle}
      <div class="breadcrumb">
        {#each $breadcrumbItems as breadcrumbItem, i}
          <span
            class="breadcrumb-text"
            class:theme={breadcrumbItem === highlightText}
            class:text-bold={breadcrumbItem === highlightText}
          >
            {$t(breadcrumbItem)}
          </span>
          {#if i + 1 < $breadcrumbItems.length}
            <span class="breadcrumb-icon">
              <Icon icon={double_arrow} />
            </span>
          {/if}
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
    border-top: 1px solid #e1e5ea;
    border-bottom: 1px solid #e1e5ea;
    padding: 10px 16px;
    align-items: center;
    box-sizing: border-box;
    height: 44px;
    z-index: 2;
    box-shadow: 10px 10px 30px rgba(107, 108, 109, 0.1);
  }
  #topbar-new.topbar-header {
    height: 55px;
  }
  .back {
    cursor: pointer;
    margin-right: 10px;
  }
  .breadcrumb {
    display: flex;
    align-items: center;
  }
  .breadcrumb-text {
    padding: 0px 2px;
  }
  .title-section {
    display: flex;
    align-items: center;
    font-weight: 600;
    text-transform: capitalize;
  }

  .text-bold {
    font-weight: 600;
  }
  .title-logo {
    height: 16px;
  }

  .breadcrumb-icon {
    padding: 2px 8px 0px;
  }

  .modal-close {
    height: 20px;
  }
</style>
