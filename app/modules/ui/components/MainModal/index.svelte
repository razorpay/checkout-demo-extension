<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { isMobile } from 'common/useragent';
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
  import { expandedHeader } from 'header';
  import { headerVisible } from 'one_click_checkout/header/store';
  import { getSession } from 'sessionmanager';
  import { testid } from 'tests/autogen';

  const emiBanks = getEMIBanks() as { BAJAJ: any };
  const ctaStore = getStore();
  const noanim = disableAnimation();
  const isOneCC = isOneClickCheckout();
  const isLiveMode = (RazorpayStore.razorpayInstance as any).isLiveMode();
  const isRedesignV15Enabled = isRedesignV15();
  let mobileDevice = isMobile();
  const orderMethod = getSingleMethod();
  export let onClose: any = returnAsIs;
  export let escape = true;

  $: offerClasses = $computeOfferClass;

  let headerExpanded = $expandedHeader;

  $: {
    setTimeout(() => {
      headerExpanded = $expandedHeader;
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
        class:header-expanded={isOneCC ? $headerVisible : headerExpanded}
      >
        {#if isRedesignV15Enabled}
          <div id="header-1cc">
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
            <div id="bottom" />

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
                {...testid('click', 'footer-cta')}
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
