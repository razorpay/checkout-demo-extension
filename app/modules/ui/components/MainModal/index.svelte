<script>
  import { isMobile } from 'common/useragent';
  import { getSession } from 'sessionmanager';
  import RazorpayStore, {
    getOption,
    isOneClickCheckout,
    isIRCTC,
  } from 'razorpay';
  import { isMethodEnabled, getEMIBanks } from 'checkoutstore/methods';
  import { getAmount, disableAnimation } from './helper';
  import { getStore } from 'checkoutstore/cta';

  const emiBanks = getEMIBanks();
  const cta = getStore();
  const noanim = disableAnimation();
</script>

<div
  id="container"
  class="mfix"
  class:mobile={isMobile()}
  class:test={!RazorpayStore.razorpayInstance.isLiveMode()}
  class:notopbar={getOption('theme.hide_topbar')}
  class:noimage={!getOption('image')}
  class:noanim
>
  <div id="backdrop" />
  <div id="tnc-wrap" />
  <div id="modal" class="mchild">
    <div id="modal-inner">
      <div id="one-cc-loader" />
      <div id="overlay" />
      <div id="nocost-overlay" class="showable" />
      <div id="confirmation-dialog" class="showable" />
      <div id="emi-wrap" class="overlay showable mfix" />
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
            <div id="logo">
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
            onsubmit="return false"
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
