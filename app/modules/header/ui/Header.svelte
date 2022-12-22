<script lang="ts">
  import { t } from 'svelte-i18n';
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import { getSession } from 'sessionmanager';
  // Imports for RTB
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';
  // session imports
  import { handleModalClose } from 'header/sessionInterface';
  import { getAmount, getMerchantName, getOption } from 'razorpay';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import { showBackArrow } from 'header/store';
  import back_arrow from 'icons/back_arrow';
  import { showFeeLabel } from 'checkoutstore/fee';
  import { createEventDispatcher, tick } from 'svelte';
  import {
    addCardView,
    dynamicFeeObject,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';
  import { fullScreenHeader } from 'header/store';
  import { themeStore } from 'checkoutstore/theme';
  import LanguageSelection from 'topbar/ui/components/LanguageSelection.svelte';
  import SecuredByRazorpay from 'ui/components/SecuredByRazorpay.svelte';
  import { getCTAAmount } from 'cta';
  import { TOTAL_AMOUNT } from 'header/i18n/label';
  import { shouldUseVernacular } from 'checkoutstore/methods';

  function setAmount(amount: number) {
    const session = getSession();
    session.setAmount(amount);
  }
  const dispatch = createEventDispatcher();
  function handleBackClick() {
    //For QR Based Feebearer payments, set the amount to the original amount.
    const amount = getAmount();
    setAmount(amount);
    // TODO evaluate $showFeeLabel
    $showFeeLabel = true;
    tick().then(() => {
      dynamicFeeObject.set({});
      showFeesIncl.set({});
      addCardView.set('');
    });
    dispatch('goback');
  }
  const merchantImage = getOption('image');
  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const name = getMerchantName();
  const closeIcon = close(20, 20, $themeStore.textColor);
</script>

<div
  class:full-screen={$fullScreenHeader}
  id="header-wrapper"
  class:dark-primary-color={$themeStore.isDarkColor}
  class:no-rtb={!isRTBEnabled && !$fullScreenHeader}
>
  {#if $fullScreenHeader}
    <div class="right-section">
      {#if getOption('theme.close_button')}
        <button class="modal-close" on:click={handleModalClose}>
          <Icon icon={closeIcon} />
        </button>
      {/if}
      <!-- TODO migrate this component to Header -->
      <LanguageSelection />
    </div>
    <div class="full-screen-header-details">
      <div
        id="logo"
        class="image-frame"
        class:merchant-initials={!merchantImage}
      >
        {#if merchantImage}
          <img src={merchantImage} alt="" />
        {:else}
          {name.slice(0, 1).toUpperCase()}
        {/if}
      </div>
      <div class="header-title-wrapper">
        <p title={name} class="header-title">
          {name}
        </p>
        {#if isRTBEnabled}
          <div class="rtb-expanded-section">
            <TrustedBadge expanded fullScreenHeader />
          </div>
        {/if}
      </div>
      <div class="amount-container">
        <div>{$t(TOTAL_AMOUNT)}</div>
        <div class="amount">{getCTAAmount(true)}</div>
      </div>
    </div>
    <div class="secured-by-message">
      <SecuredByRazorpay withPrimaryBackground />
    </div>
  {:else}
    <div class="header-container">
      <div class="left-section">
        <span
          class="back"
          class:show={$showBackArrow && !getOption('theme.hide_topbar')}
          on:click={handleBackClick}
        >
          <Icon icon={back_arrow($themeStore.textColor)} />
        </span>
        {#if merchantImage || name}
          <div
            id="logo"
            class:image-frame={true}
            class:merchant-initials={!merchantImage}
          >
            {#if merchantImage}
              <img src={merchantImage} alt="" />
            {:else}
              {name.slice(0, 1).toUpperCase()}
            {/if}
          </div>
        {/if}
        <div class="header-title-wrapper">
          <p
            title={name}
            class="header-title"
            class:header-title-collapse={shouldUseVernacular()}
          >
            {name}
          </p>
          {#if isRTBEnabled}
            <div class="rtb-expanded-section">
              <TrustedBadge expanded />
            </div>
          {/if}
        </div>
      </div>
      <div class="right-section">
        {#if getOption('theme.close_button')}
          <button class="modal-close" on:click={handleModalClose}>
            <Icon icon={closeIcon} />
          </button>
        {/if}
        <!-- TODO migrate this component to Header -->
        <LanguageSelection />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  #header-wrapper {
    box-shadow: 0px 4px 8px rgba(23, 26, 30, 0.15);
    position: sticky;
    z-index: 2;
    padding: 0 16px;
    height: 80px;
    display: flex;
    align-items: center;
    background-color: var(--primary-color);
    color: var(--text-color);
    &.full-screen {
      height: calc(100% - 8px);
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: none;
      .header-title-wrapper p {
        align-self: center;
        font-size: 20px;
      }

      #logo {
        margin: 0;
        border-radius: 12px;
        &.merchant-initials {
          line-height: 60px;
          font-size: 32px;
          color: var(--text-color);
        }
      }
    }
  }
  #header-wrapper.full-screen {
    position: relative;
    justify-content: center;
    .amount-container {
      margin-top: 36px;
      text-align: center;
      & > div {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-body);
        color: var(--text-color);
        opacity: 0.7;
      }
      .amount {
        margin-top: 4px;
        font-size: 28px;
        line-height: 130%;
        opacity: 1;
      }
    }
    .full-screen-header-details {
      height: 65%;
      max-height: 290px;
      display: flex;
      align-items: center;
      flex-direction: column;
      width: 100%;
      .header-title-wrapper {
        width: calc(100% - 16px);
        max-width: 344px;
        margin-top: 18px;
        justify-content: flex-start;
      }
      .rtb-expanded-section {
        margin-top: 12px;
        align-self: center;
      }
    }
    .secured-by-message {
      position: absolute;
      bottom: 0;
    }
    .right-section {
      flex-direction: row-reverse;
      height: auto;
      width: 66px;
      top: 25px;
      right: 16px;
      padding-right: 4px;
      box-sizing: border-box;
      .modal-close {
        align-self: center;
        padding: 0;
        height: 14px;
      }
    }
    #logo {
      width: 64px;
      height: 64px;
      margin-right: 0;
      &.image-frame {
        width: 64px;
        height: 64px;
      }
      &.merchant-initials {
        line-height: 64px;
      }
    }
  }

  #header-wrapper.no-rtb {
    height: 68px;
    #logo {
      width: 36px;
      height: 36px;
      margin-right: 16px;
      &.image-frame {
        width: 36px;
        height: 36px;
      }
      &.merchant-initials {
        line-height: 36px;
      }
    }
    .right-section {
      flex-direction: row-reverse;
      height: auto;
      width: 66px;
    }
    .header-title {
      font-size: 18px;
    }

    .header-title-collapse {
      max-width: calc(100% - 86px);
    }

    .modal-close {
      height: 20px;
      width: 18px;
    }
    .header-title-wrapper {
      height: auto;
    }
  }
  #logo {
    margin-left: 0;
    width: 46px;
    height: 46px;
    margin-bottom: 0;
    transition: height 0.2s, width 0.2s, margin-left 0.4s ease;
    position: relative;
    img {
      vertical-align: initial;
      border-radius: 2px;
      box-shadow: 0px 0px 0px 2px var(--light-highlight-color);
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      margin: auto;
      width: 100%;
    }
  }
  .dark-primary-color {
    #logo {
      &.merchant-initials,
      img {
        box-shadow: 0px 0px 0px 2px #ffffff57;
      }
    }
  }
  #logo {
    margin-right: 12px;
  }
  #logo.image-frame {
    box-sizing: border-box;
    background: none;
    box-shadow: none;
    padding: 0;
    width: 46px;
    height: 46px;
  }
  #logo.merchant-initials {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    box-shadow: 0px 0px 0px 2px var(--light-highlight-color);
    color: var(--text-color);
    font-size: 18px;
    line-height: 46px;
    font-weight: var(--font-weight-medium);
    text-align: center;
  }

  .header-container {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0;
    align-items: center;
    border-bottom: 0;
  }
  .left-section {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .right-section {
    position: absolute;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .back {
    max-width: 0;
    margin: 0;
    overflow: hidden;
    transform: scale(0);
    transition: transform 0.4s ease;
    &.show {
      transform: scale(1);
      max-width: 100%;
      & + #logo {
        margin-left: 10px;
      }
    }
  }
  .back :global(svg) {
    width: 14px;
    height: 14px;
    cursor: pointer;
  }
  .header-title {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
    line-height: 22px;
    max-width: calc(100% - 25px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  .rtb-section {
    padding: 0;
    margin-left: 7px;
    align-self: center;
    margin-top: 1px;
  }
  .rtb-expanded-section {
    padding: 0;
    align-self: flex-start;
    margin: 0;
    height: 20px;
    :global(.rtb-expanded-wrapper) {
      display: inline-flex;
      background-color: var(--light-highlight-color);
    }
  }

  .header-title-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    width: calc(100% - 70px);
    height: 46px;
    justify-content: space-between;
  }

  .modal-close {
    align-items: center;
    align-self: flex-end;
    left: 2px;
    :global(svg) {
      height: 14px;
      width: 14px;
    }
  }
</style>
