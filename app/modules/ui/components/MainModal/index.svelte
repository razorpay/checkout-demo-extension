<script lang="ts">
  import { hasClass } from 'utils/DOM';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { isMobile } from 'common/useragent';
  import RazorpayStore, {
    getOption,
    isOneClickCheckout,
    isIRCTC,
  } from 'razorpay';
  import { isMethodEnabled, getEMIBanks } from 'checkoutstore/methods';
  import { getAmount, disableAnimation, bringInputIntoView } from './helper';
  import { returnAsIs } from 'lib/utils';
  import { overlayStack } from 'checkoutstore/back';
  import { getStore } from 'checkoutstore/cta';
  import { isOverlayActive } from 'navstack';
  import { getView } from 'checkoutframe/components';

  const emiBanks = getEMIBanks() as { BAJAJ: any };
  const cta = getStore();
  const noanim = disableAnimation();
  const isLiveMode = (RazorpayStore.razorpayInstance as any).isLiveMode();
  let mobileDevice = isMobile();

  export let onClose: any = returnAsIs;
  export let escape = true;

  function handleKeyInput(e: KeyboardEvent) {
    if ((e.which || e.keyCode) === 27) {
      // Element wants to handle "Escape" by itself
      if (hasClass(e.target, 'no-escape')) {
        return;
      }
      if (onClose) {
        preCloseCheck(onClose);
      }
    }
  }

  function handleResize() {
    mobileDevice = isMobile();
    bringInputIntoView();
  }

  onMount(() => {
    window.addEventListener('resize', handleResize);
    if (escape) {
      window.addEventListener('keyup', handleKeyInput);
    }
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keyup', handleKeyInput);
  });

  function preCloseCheck(next: () => void) {
    const $overlayStack = get(overlayStack);
    if ($overlayStack.length > 0) {
      const last: any = $overlayStack[$overlayStack.length - 1];
      last.back({
        from: 'overlay',
      });
    } else if (isOverlayActive()) {
      getView('navStack').backPressed();
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
  class:mobile={mobileDevice}
  class:test={!isLiveMode}
  class:notopbar={getOption('theme.hide_topbar')}
  class:noimage={!getOption('image')}
  class:noanim
>
  <div id="backdrop" on:click={() => preCloseCheck(handleBackdropClick)} />
  <div id="tnc-wrap" />
  <div id="modal" class="mchild">
    <div id="modal-inner">
      <div id="one-cc-loader" />
      <div id="overlay" />
      <div id="confirmation-dialog" class="showable" />
      <div id="recurring-cards-wrap" class="overlay showable mfix" />
      <div id="fee-wrap" class="overlay showable mfix" />
      <div id="one-cc-summary" />
      <div id="options-wrap" />
      <div id="error-message" class="overlay showable">
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
      <div id="content" class:one-cc={isOneClickCheckout()}>
        <div id="header">
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
              {getOption('description').trim()}
            </div>
            {#if getOption('amount')}
              <div id="amount">
                <span class="discount" />
                <span class="original-amount">{getAmount()}</span>
                <span class="fee" />
              </div>
            {/if}
          </div>
          <div id="language-dropdown" />
        </div>
        <div id="body" class="sub">
          <div id="topbar-wrap" />
          <div id="messages" />
          <form
            id="form"
            method="POST"
            novalidate
            autocomplete="off"
            on:submit|preventDefault={() => false}
          >
            <div id="root" />
            <div id="form-fields">
              <div id="body-overlay" />
              {#if isIRCTC()}
                <div
                  class="recurring-message"
                  style="right: 0;left: 0;border-radius:0 0 3px 3px"
                >
                  <span>&#x2139;</span>
                  *Payment charges and taxes as applicable.
                </div>
              {/if}

              {#if isMethodEnabled('emi') && emiBanks.BAJAJ}
                <div class="tab-content showable screen" id="form-emi" />
              {/if}
            </div>
            <div id="bottom" />
            <div id="footer" role="button" class="button">
              <span id="footer-cta">{cta}</span>
            </div>
            <button type="submit" />
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="css">
  #logo.image-frame {
    background: none;
    box-shadow: none;
    padding: 0;
    width: 80px;
    height: 80px;
  }
</style>
