<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { isMobile, isMediumScreen } from 'common/useragent';
  import RazorpayStore, {
    getOption,
    isRedesignV15,
    isIRCTC,
    isOneClickCheckout,
    isEmbedded,
  } from 'razorpay';
  import {
    isMethodEnabled,
    getEMIBanks,
    getSingleMethod,
  } from 'checkoutstore/methods';
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';
  import { getAmount, disableAnimation, bringInputIntoView } from './helper';
  import { returnAsIs } from 'lib/utils';
  import { getStore, MainCTA as CTA } from 'cta';
  import NavigationStack, {
    backPressed,
    isOverlayActive,
    onPopStack,
    OverlayStack,
  } from 'navstack';
  import OneCCLoader from 'one_click_checkout/loader/Loader.svelte';
  import { clearOldExperiments } from 'experiments';

  import LanguageSelector from './LanguageSelector.svelte';
  import { computeOfferClass } from 'offers/store';
  import { fullScreenHeader } from 'header';
  import { headerVisible } from 'one_click_checkout/header/store';
  import { getSession } from 'sessionmanager';
  import autotest from 'autotest';
  import {
    HEADER_SIZE,
    offerFade,
    headerVisible as checkoutHeaderVisible,
    bodyHeight,
  } from 'header/store';
  import { isMobileStore } from 'checkoutstore';
  import { showBottomElement } from 'checkoutstore';
  import {
    isContactValid,
    isEmailValid,
  } from 'one_click_checkout/common/details/store';
  import { country } from 'checkoutstore/screens/home';
  import { locale } from 'svelte-i18n';

  const emiBanks = getEMIBanks() as { BAJAJ: any };
  const ctaStore = getStore();
  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const noanim = disableAnimation();
  const isOneCC = isOneClickCheckout();
  const isLiveMode = RazorpayStore.razorpayInstance.isLiveMode();
  const isRedesignV15Enabled = isRedesignV15();
  let mobileDevice = isMobile();
  let mediumScreenDevice = isMediumScreen();
  const orderMethod = getSingleMethod();
  export let onClose: any = returnAsIs;
  export let escape = true;

  let bottomContainer: HTMLDivElement;
  let bodyElement: HTMLDivElement;

  $: offerClasses = $computeOfferClass;

  const MEDIUM_HEADER_HEIGHT = '150px';

  let fullScreenHeaderHeight = 'auto';
  $: {
    tick().then(() => {
      if ($fullScreenHeader && $country && $locale) {
        // add store to make it reactive
        !$isContactValid || !$isEmailValid;
        let initialBodyHeight = 400;
        const paymentDetailBlock = document.getElementById(
          'payment-details-block'
        ) as HTMLDivElement;
        const CTAContainer = document.querySelector(
          '.cta-container'
        ) as HTMLDivElement;
        /**
         * get actual payment detail page height + CTA height & (-10px to reduce padding distance b/w content and cta)
         * if we are not able to read detail page height then it fallback to 400px height
         * causing header to load minimal header
         */
        if (paymentDetailBlock && paymentDetailBlock.offsetHeight) {
          initialBodyHeight =
            paymentDetailBlock.offsetHeight +
            (CTAContainer?.offsetHeight || 65) -
            10;
        }
        if (bottomContainer?.offsetHeight) {
          initialBodyHeight += (bottomContainer?.offsetHeight || 0) + 10;
        }

        $bodyHeight = initialBodyHeight;
        fullScreenHeaderHeight =
          $fullScreenHeader === HEADER_SIZE.MEDIUM
            ? MEDIUM_HEADER_HEIGHT
            : `calc(100% - ${initialBodyHeight}px)`;
      }
    });
  }

  function handleKeyInput(e: KeyboardEvent) {
    if ((e.which || e.keyCode) === 27) {
      if (onClose) {
        preCloseCheck(onClose);
      }
    }
  }

  function handleResize() {
    mobileDevice = isMobile();
    mediumScreenDevice = isMediumScreen();
    isMobileStore.set(mobileDevice);
    bringInputIntoView();
  }

  function handleOneCCScreenHeight() {
    return (
      isRedesignV15Enabled && mobileDevice && window.screen?.availHeight > 600
    );
  }

  onMount(() => {
    clearOldExperiments();
    window.addEventListener('resize', handleResize);
    if (escape) {
      window.addEventListener('keyup', handleKeyInput);
    }

    const unsub = onPopStack(({ isOverlay, stackCount }) => {
      if (!isOverlay && stackCount === 0) {
        // session.back responsible for clear data member + analytic events
        // TODO remove session
        const session = getSession();
        session.back();
      }
    });

    return () => unsub();
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keyup', handleKeyInput);
  });

  function preCloseCheck(next: () => void) {
    if (isOverlayActive()) {
      backPressed();
    } else {
      next();
    }
  }

  function handleBackdropClick() {
    if (getOption('modal.backdropclose')) {
      onClose();
    }
  }

  export function animation() {
    return !noanim;
  }
</script>

<div
  id="container"
  class="mfix"
  class:redesign={isRedesignV15Enabled}
  class:mobile={mobileDevice}
  class:medium-screen={mediumScreenDevice}
  class:irctc={isIRCTC()}
  class:test={!isLiveMode}
  class:notopbar={getOption('theme.hide_topbar')}
  class:noimage={!getOption('image')}
  class:noanim
  class:one-method={orderMethod}
>
  <div id="backdrop" on:click={() => preCloseCheck(handleBackdropClick)} />
  <!-- todo remove one-cc (migrate to .redesign) -->
  <div
    id="modal"
    class="mchild"
    class:full-height={!isEmbedded()}
    class:one-cc={isRedesignV15Enabled}
    class:checkout-flow={isRedesignV15Enabled && !isOneCC}
    class:one-click-checkout={isOneCC}
  >
    <div id="modal-inner">
      <OverlayStack />
      <div id="error-message" class="overlay showable">
        <div class="error-message-content">
          <div class="omnichannel">
            <img
              style="width:35px;"
              src="https://cdn.razorpay.com/app/googlepay.svg"
              alt=""
            />
            <div id="overlay-close" class="close">×</div>
          </div>
          <div id="fd-t" />
          <div class="spin"><div /></div>
          <div class="spin spin2"><div /></div>
          <span class="link" />
          <button id="fd-hide" class="btn">Retry</button>
          <div id="cancel_upi" />
        </div>
      </div>

      <div
        id="content"
        class:has-fee={offerClasses.hasFee}
        class:has-discount={offerClasses.hasDiscount}
        class:one-cc={isRedesignV15Enabled}
        class:header-expanded={isOneCC ? $headerVisible : true}
      >
        {#if isRedesignV15Enabled}
          <div
            id="redesign-header"
            class:no-rtb={!isRTBEnabled}
            class:hidden={!$checkoutHeaderVisible}
            class:offers-fade={$offerFade}
            class:full-screen-header={$fullScreenHeader}
            style={$fullScreenHeader
              ? `max-height: ${fullScreenHeaderHeight}`
              : ''}
          >
            <div id="header-redesign-v15-wrap" />
            <div id="topbar-redesign-v15-wrap" />
          </div>
        {/if}
        <div id="header" class:hidden={isRedesignV15Enabled}>
          {#if getOption('theme.close_button')}
            <div id="modal-close" class="close">×</div>
          {/if}
          {#if getOption('image')}
            <div id="logo" class:image-frame={!getOption('theme.image_frame')}>
              <img src={getOption('image')} alt="" />
            </div>
          {/if}
          <div id="merchant">
            {#if getOption('name')}
              <div id="merchant-name">
                {getOption('name')}
              </div>
            {/if}
            <div id="merchant-desc">
              {getOption('description')?.trim()}
            </div>
            {#if getOption('amount')}
              <div id="amount">
                <span class="discount">{offerClasses.discountAmount}</span>
                <span
                  class="original-amount"
                  class:hidden={offerClasses.hideOriginalAmount}
                  >{getAmount()}</span
                >
                <span class="fee" />
              </div>
            {/if}
          </div>
          <LanguageSelector />
        </div>
        {#if isIRCTC()}
          <div
            class="recurring-message"
            style="right: 0;left: 0;border-radius:0 0 3px 3px"
          >
            <span>&#x2139;</span>
            Payment charges and taxes are applicable.
          </div>
        {/if}
        <div
          id="body"
          class="sub"
          bind:this={bodyElement}
          class:one-cc-screen={handleOneCCScreenHeight()}
        >
          <div id="topbar-wrap" />
          <div id="messages" />
          <form
            id="form"
            method="POST"
            novalidate
            autocomplete="off"
            on:submit|preventDefault={() => false}
          >
            <NavigationStack />
            <div id="form-fields">
              {#if isMethodEnabled('emi') && emiBanks.BAJAJ}
                <div
                  class:tab-content={!isRedesignV15Enabled}
                  class="showable screen"
                  id="form-emi"
                />
              {/if}
            </div>
            <div id="toast" />
            <div
              id="bottom"
              bind:this={bottomContainer}
              class:hidden={!$showBottomElement}
            />

            {#if isRedesignV15Enabled}
              <OneCCLoader />
            {/if}
            {#if isRedesignV15Enabled}
              <CTA />
            {:else}
              <div
                id="footer"
                role="button"
                class="button"
                class:hidden={isRedesignV15Enabled}
                {...autotest('cta')}
              >
                <span id="footer-cta">{ctaStore}</span>
              </div>
            {/if}
            <div id="redesign-v15-footer" />
            <button type="submit" />
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  #toast {
    position: relative;
  }
  #form {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  #logo.image-frame {
    background: none;
    box-shadow: none;
    padding: 0;
    width: 80px;
    height: 80px;
  }
  .one-cc-screen {
    min-height: 440px;
    height: 440px;
    flex-basis: 440px;
  }

  .mobile .one-cc-screen {
    min-height: auto;
  }

  :global(.mobile) .checkout-flow #redesign-header {
    border-radius: 0;
  }

  .checkout-flow {
    #redesign-header {
      border-radius: 8px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      max-height: 80px;
      min-height: fit-content;
      height: 80px;
      transition: all 0.5s;
      background: var(--primary-color);
      position: relative;
      background-image: linear-gradient(
        143.63deg,
        rgba(255, 255, 255, 0.19) 0%,
        rgba(0, 0, 0, 0.1) 100%
      );
      background-size: cover;
      background-attachment: fixed;

      &.no-rtb {
        height: 68px;
      }
    }

    #redesign-header.full-screen-header {
      height: calc(100% - 12px);
      overflow: hidden;
      max-height: 100%;
      display: flex;
      flex-direction: column-reverse;
      justify-content: flex-end;
      box-shadow: 2px 2px 30px rgba(107, 108, 109, 0.1);
      z-index: 0;
      color: var(--text-color);
      background-color: var(--primary-color);

      #header-redesign-v15-wrap {
        height: 100%;
      }
    }
  }

  .redesign {
    #error-message {
      padding-top: 0;
    }
    #fd-t {
      padding: 0 15px 10px;
    }

    .error-message-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
