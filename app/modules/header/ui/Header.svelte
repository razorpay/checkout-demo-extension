<script lang="ts">
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
  import { themeStore } from 'checkoutstore/theme';
  import LanguageSelection from 'topbar/ui/components/LanguageSelection.svelte';

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

  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const name = getMerchantName();
  const closeIcon = close(20, 20, $themeStore.textColor);
</script>

<div
  id="header-wrapper"
  class:no-rtb={!isRTBEnabled}
  class:dark-primary-color={$themeStore.isDarkColor}
>
  <div class="header-container">
    <div class="left-section">
      <span class="back" class:show={$showBackArrow} on:click={handleBackClick}>
        <Icon icon={back_arrow($themeStore.textColor)} />
      </span>
      {#if getOption('image') || name}
        <div
          id="logo"
          class:image-frame={true}
          class:merchant-initials={!getOption('image')}
        >
          {#if getOption('image')}
            <img src={getOption('image')} alt="" />
          {:else}
            {name.slice(0, 1).toUpperCase()}
          {/if}
        </div>
      {/if}
      <div class="header-title-wrapper">
        <p title={name} class="header-title">
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
</div>

<style lang="scss">
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
      max-width: calc(100% - 86px);
      font-size: 18px;
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
    font-weight: 500;
  }

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
    font-weight: 600;
    font-size: 14px;
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
    height: 12px;
    padding: 0px;
    position: relative;
    display: flex;
    align-items: center;
    align-self: flex-end;
    left: 2px;

    :global(svg) {
      height: 14px;
      width: 14px;
    }
  }
</style>
