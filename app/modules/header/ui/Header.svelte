<script lang="ts">
  import { t } from 'svelte-i18n';
  // Imports for RTB
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';
  // session imports
  import { getSession } from 'sessionmanager';
  import { handleModalClose } from 'header/sessionInterface';

  import { createEventDispatcher, tick, onMount } from 'svelte';

  import { TOTAL_AMOUNT } from 'header/i18n/label';
  // helper
  import { getCTAAmount } from 'cta';
  import {
    getAmount,
    getCurrency,
    getMerchantName,
    getOption,
    isContactEmailOptional,
    isCustomerFeeBearer,
    isOfferForced,
  } from 'razorpay';
  // utils
  import { getTPV, shouldUseVernacular } from 'checkoutstore/methods';
  import { flip } from 'utils/animate';
  import {
    formatAmountWithSymbol,
    formatAmountWithSymbolRawHtml,
  } from 'common/currency';
  // Store
  import {
    computeShowBottomElementThatImpactHeader,
    HEADER_SIZE,
    showBackArrow,
  } from 'header/store';
  import {
    addCardView,
    dynamicFeeObject,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';
  import { showFeeLabel } from 'checkoutstore/fee';
  import { fullScreenHeader } from 'header/store';
  import { themeStore } from 'checkoutstore/theme';
  import { appliedOffer } from 'offers/store';
  import { getCardOffer } from 'checkoutframe/offers';
  import { showBottomElement } from 'checkoutstore';
  // UI import
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import back_arrow from 'icons/back_arrow';
  import LanguageSelection from 'topbar/ui/components/LanguageSelection.svelte';
  import SecuredByRazorpay from 'ui/components/SecuredByRazorpay.svelte';
  import FeeLabel from 'ui/components/FeeLabel.svelte';
  import CardOffer from 'ui/elements/CardOffer.svelte';
  import TpvBankNew from 'ui/elements/TpvBank.new.svelte';
  //
  import type { TPVBank } from 'tpv/types/tpv';
  import { getPrefillBankDetails } from 'netbanking/helper';

  let fullScreen: boolean;
  let merchantLogo: HTMLElement;
  let logoTitleContainer: HTMLElement;
  let headerTitle: HTMLElement;
  let rtb: HTMLElement;
  let closeButton: HTMLElement;
  let vernacularButton: HTMLElement;
  let animate = false;

  let offerAmount = 0;
  let bottomEle = computeShowBottomElementThatImpactHeader();

  const tpv = getTPV() as unknown as TPVBank;

  $: {
    if (
      $appliedOffer &&
      $appliedOffer.original_amount &&
      $appliedOffer.amount
    ) {
      offerAmount = $appliedOffer.original_amount - $appliedOffer.amount;
    } else {
      offerAmount = 0;
    }
  }

  onMount(() => {
    setTimeout(() => {
      animate = true;
    }, 300);
    const unsubscribe = fullScreenHeader.subscribe((value) => {
      if (animate) {
        flip(() => {
          fullScreen = value === HEADER_SIZE.FULL_SCREEN;
        }, [
          merchantLogo,
          headerTitle,
          rtb,
          closeButton,
          vernacularButton,
          logoTitleContainer,
        ]);
        animate = true;
      } else {
        fullScreen = value === HEADER_SIZE.FULL_SCREEN;
      }
    });

    return unsubscribe;
  });

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
  class:full-screen={fullScreen}
  class:medium-header={$fullScreenHeader === HEADER_SIZE.MEDIUM}
  id="header-wrapper"
  class:dark-primary-color={$themeStore.isDarkColor}
  class:rtb-disabled={!isRTBEnabled}
  class:with-offer={offerAmount > 0}
  class:contain-bottom-element={bottomEle.total === 1 &&
    !bottomEle.isOnlyTimeoutVisible}
  class:no-rtb={!isRTBEnabled && $fullScreenHeader !== HEADER_SIZE.FULL_SCREEN}
>
  <div class="header-container">
    <div class="left-section">
      <span
        class="back"
        class:show={($showBackArrow && !getOption('theme.hide_topbar')) ||
          getOption('theme.show_back_always')}
        on:click={handleBackClick}
      >
        <Icon icon={back_arrow($themeStore.textColor)} />
      </span>
      <div class="logo-title-container" bind:this={logoTitleContainer}>
        {#if merchantImage || name}
          <div
            id="logo"
            class="image-frame"
            bind:this={merchantLogo}
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
            data-avoid-width-stretch={true}
            bind:this={headerTitle}
            class:header-title-collapse={shouldUseVernacular()}
          >
            {name}
          </p>
          {#if isRTBEnabled}
            <div class="rtb-expanded-section" bind:this={rtb}>
              <TrustedBadge expanded fullScreenHeader={fullScreen} />
            </div>
          {/if}
        </div>
      </div>
      {#if $fullScreenHeader}
        <div class="amount-container">
          <div class="total-amount">{$t(TOTAL_AMOUNT)}</div>
          <div class="amount-fee-container">
            {#if offerAmount > 0}
              <span class="offer-original-amount">
                {formatAmountWithSymbol(
                  $appliedOffer?.original_amount || getAmount(),
                  getCurrency(),
                  true
                )}
              </span>
            {/if}
            <div class="amount">
              {#if offerAmount > 0 && $appliedOffer?.amount}
                {@html formatAmountWithSymbolRawHtml(
                  $appliedOffer?.amount || getAmount(),
                  getCurrency(),
                  true
                )}
              {:else}
                {@html getCTAAmount(true)}
              {/if}
            </div>
            {#if isCustomerFeeBearer()}
              <span class="fee-container">
                <FeeLabel fromHeader />
              </span>
            {/if}
          </div>
          {#if !$showBottomElement}
            <div class="bottom-element-container">
              {#if isOfferForced() && getCardOffer()}
                <CardOffer offer={getCardOffer()} />
              {/if}
              {#if tpv && !tpv.invalid && tpv.method}
                <TpvBankNew
                  bank={tpv}
                  accountName={getPrefillBankDetails('name')}
                  showIfsc={isContactEmailOptional()}
                />
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <div class="right-section">
      {#if getOption('theme.close_button')}
        <button
          class="modal-close"
          bind:this={closeButton}
          on:click={handleModalClose}
        >
          <Icon icon={closeIcon} />
        </button>
      {/if}
      <!-- TODO migrate this component to Header -->
      <span bind:this={vernacularButton}>
        <LanguageSelection />
      </span>
    </div>
  </div>

  {#if $fullScreenHeader}
    <div class="secured-by-message">
      <SecuredByRazorpay lockIcon withPrimaryBackground />
    </div>
  {/if}
</div>

<style lang="scss">
  #header-wrapper {
    border-radius: 8px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0px 4px 8px rgba(23, 26, 30, 0.15);
    position: sticky;
    z-index: 2;
    padding: 0 16px;
    height: 80px;
    display: flex;
    align-items: center;
    background-color: var(--primary-color);
    background-image: linear-gradient(
      143.63deg,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
    background-size: cover;
    background-attachment: fixed;
    color: var(--text-color);
    transition: box-shadow 0.3s;
    transition-delay: 0.5s;

    &.medium-header {
      box-shadow: none;
    }

    &.full-screen {
      transition: none;
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

  :global(.mobile) #header-wrapper {
    border-radius: 0;

    .amount-container {
      margin-top: 36px;
    }
  }

  .amount-container {
    width: 100%;
    max-width: 300px;
    margin-top: 26px;
    text-align: center;

    :global(.card-offer),
    :global(.customer-bank-details) {
      color: #000000;
      border-radius: 6px;
    }

    .total-amount {
      color: var(--light-text-color);
    }

    .offer-original-amount {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-color);
      opacity: 0.7;
      text-decoration: line-through;
    }

    .amount-fee-container {
      .amount {
        margin-top: 4px;
        font-size: 28px;
        line-height: 130%;
        opacity: 1;
        margin-bottom: 2px;
      }

      :global(.currency-symbol) {
        font-size: 24px;
      }

      & > div {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-body);
        color: var(--text-color);
        opacity: 0.7;
      }
    }
  }

  #header-wrapper.medium-header {
    box-shadow: none;

    .amount-container {
      position: absolute;
      bottom: -98px;
      margin: 0 !important;
      height: 70px;

      & > div {
        text-align: left;
      }

      .amount-fee-container {
        display: flex;
        align-items: baseline;
      }

      .amount {
        text-align: left;
        font-size: 24px;
      }

      :global(.currency-symbol) {
        font-size: 20px;
      }
    }

    .secured-by-message {
      position: absolute;
      right: 20px;
      bottom: -60px;
    }
  }

  #header-wrapper.medium-header.with-offer .amount-container .amount {
    margin-left: 6px;
  }

  :global(.medium-screen) #header-wrapper.full-screen {
    #logo {
      width: 56px;
      height: 56px;
      min-width: 56px;
      min-height: 56px;
      margin-right: 0;
      &.image-frame {
        width: 56px;
        height: 56px;
      }
      &.merchant-initials {
        line-height: 56px;
        font-size: 26px;
      }
    }

    .header-title {
      font-size: 18px;
    }
  }

  #header-wrapper.full-screen {
    .back {
      left: 0;

      & + .logo-title-container {
        transform: translateX(0);
      }
    }
  }

  #header-wrapper.full-screen.rtb-disabled {
    .left-section,
    .logo-title-container {
      max-height: 220px;
    }
  }

  #header-wrapper.full-screen {
    position: relative;
    justify-content: center;

    .header-container {
      height: 100%;
    }

    .left-section,
    .logo-title-container {
      height: 100%;
      max-height: 245px;
      display: flex;
      align-items: center;
      flex-direction: column;
      width: 100%;
      .header-title-wrapper {
        width: calc(100% - 16px);
        max-width: 344px;
        margin-top: 18px;
        justify-content: flex-start;
        height: auto;
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
      top: 24px;
      right: 0;
      box-sizing: border-box;
      .modal-close {
        align-self: center;
        margin-right: -6px;
        position: relative;
        left: 2px;
      }
    }
    #logo {
      width: 64px;
      height: 64px;
      min-width: 64px;
      min-height: 64px;
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

  #header-wrapper.contain-bottom-element.full-screen {
    .bottom-element-container {
      margin: 10px 0;
      display: flex;
      justify-content: center;

      & > :global(*) {
        width: fit-content;
      }
    }

    .left-section {
      max-height: 270px;
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
    position: relative;
    overflow: hidden;
    img {
      vertical-align: initial;
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
      &.image-frame {
        box-shadow: 0px 0px 0px 2px #ffffff57;
      }
    }
  }
  #logo {
    margin-right: 12px;
  }
  #logo.image-frame {
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: 0px 0px 0px 2px var(--light-highlight-color);
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
  .left-section,
  .logo-title-container {
    transform: translateX(0);
    width: 100%;
    display: flex;
    align-items: center;
    transition: transform 0.4s ease;
  }

  .back.show + .logo-title-container {
    transform: translateX(25px);
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
    z-index: 2;
    max-width: 0;
    margin: 0;
    overflow: hidden;
    transform: scale(0);
    transition: transform 0.4s ease;
    &.show {
      position: absolute;
      transform: scale(1);
      max-width: 100%;
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

  .fee-container {
    :global(.fee) {
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-body);
      line-height: 130%;
      opacity: 0.7;
    }

    :global(.dynamic-label) {
      float: unset;

      :global(.tooltip) {
        left: 15px !important;
      }
    }

    :global(.tooltip.fee-tooltip.from-header.tooltip-top.tooltip-right) {
      top: -5px !important;
    }
  }
  .medium-header .fee-container {
    :global(.dynamic-label .tooltip) {
      left: 0px !important;
    }
    :global(.dynamic-fee-tooltip.tooltip.from-header) {
      transform: translate(16%, -61%);

      &::before {
        left: -5px;
        transform: rotate(0deg);
        top: calc(100% - 20px);
      }
    }
  }
</style>
